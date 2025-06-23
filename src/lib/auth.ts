import bcrypt from 'bcryptjs'
import { supabase, supabaseAdmin } from './supabase'
import { Database } from '@/types/database'

type ChildProfile = Database['public']['Tables']['child_profiles']['Row']
type ParentAccount = Database['public']['Tables']['parent_accounts']['Row']

export class ParentAuth {
  static async sendOtpCode(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    })
    
    if (error) throw error
    return { success: true }
  }

  static async verifyOtpCode(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    
    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async createParentAccount(userId: string, email: string) {
    const { data, error } = await supabaseAdmin
      .from('parent_accounts')
      .insert({
        id: userId,
        email
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getParentAccount(userId: string): Promise<ParentAccount | null> {
    const { data, error } = await supabaseAdmin
      .from('parent_accounts')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) return null
    return data
  }
}

export class ChildAuth {
  static async hashPin(pin: string): Promise<string> {
    return await bcrypt.hash(pin, 12)
  }

  static async verifyPin(pin: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pin, hash)
  }

  static async createChildProfile(data: {
    parentId: string
    username: string
    name: string
    ageGroup: 'preschoolers' | 'kids' | 'tweens'
    pin: string
    avatarUrl?: string
    parentalConsent?: boolean
  }) {
    const pinHash = await this.hashPin(data.pin)
    
    const { data: child, error } = await supabaseAdmin
      .from('child_profiles')
      .insert({
        parent_id: data.parentId,
        username: data.username.toLowerCase(),
        name: data.name,
        age_group: data.ageGroup,
        pin_hash: pinHash,
        avatar_url: data.avatarUrl || null,
        parental_consent: data.parentalConsent || false
      })
      .select()
      .single()

    if (error) throw error

    await supabaseAdmin
      .from('user_stats')
      .insert({
        child_id: child.id
      })

    return child
  }

  static async authenticateChild(childId: string, pin: string): Promise<ChildProfile | null> {
    const { data: child, error } = await supabaseAdmin
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .single()

    if (error || !child) return null

    const isValidPin = await this.verifyPin(pin, child.pin_hash)
    if (!isValidPin) return null

    return child
  }

  static async authenticateChildByUsername(username: string, pin: string): Promise<ChildProfile | null> {
    const { data: child, error } = await supabaseAdmin
      .from('child_profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single()

    if (error || !child) return null

    const isValidPin = await this.verifyPin(pin, child.pin_hash)
    if (!isValidPin) return null

    return child
  }

  static async getChildProfile(childId: string): Promise<ChildProfile | null> {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('id', childId)
      .single()

    if (error) return null
    return data
  }

  static async getChildrenByParent(parentId: string): Promise<ChildProfile[]> {
    const { data, error } = await supabaseAdmin
      .from('child_profiles')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true })

    if (error) return []
    return data
  }

  static async updateParentalConsent(childId: string, consent: boolean) {
    const { error } = await supabaseAdmin
      .from('child_profiles')
      .update({ parental_consent: consent })
      .eq('id', childId)

    if (error) throw error
    return { success: true }
  }
}


export class ChildSession {
  static getCurrentChildFromRequest(request: Request): { childId: string } | null {
    try {
      // Use synchronous require for server-side compatibility
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { cookies } = require('next/headers')
      const cookieStore = cookies()
      const authCookie = cookieStore.get('child_auth')
      
      if (!authCookie?.value) {
        return null
      }

      const authData = JSON.parse(authCookie.value)
      return { childId: authData.childId }
    } catch (error) {
      console.error('Failed to parse child auth cookie:', error)
      return null
    }
  }

  static async getCurrentChild(request: Request): Promise<ChildProfile | null> {
    const session = this.getCurrentChildFromRequest(request)
    if (!session) return null

    return await ChildAuth.getChildProfile(session.childId)
  }
}

export async function verifyParentAuth(request: Request) {
  try {
    const user = await ParentAuth.getCurrentUser()
    if (!user) {
      return { parent: null, error: 'Not authenticated' }
    }

    const parent = await ParentAuth.getParentAccount(user.id)
    if (!parent) {
      return { parent: null, error: 'Parent account not found' }
    }

    return { parent, error: null }
  } catch (error) {
    return { parent: null, error: 'Authentication failed' }
  }
}

export class SessionManager {
  static CHILD_SESSION_COOKIE = 'child_session'
  static PARENT_SESSION_COOKIE = 'parent_session'

  static setChildSession(childId: string, response: Response) {
    const sessionData = {
      childId,
      timestamp: Date.now()
    }
    
    response.headers.set(
      'Set-Cookie',
      `${this.CHILD_SESSION_COOKIE}=${JSON.stringify(sessionData)}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`
    )
  }

  static clearChildSession(response: Response) {
    response.headers.set(
      'Set-Cookie',
      `${this.CHILD_SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
    )
  }

  static getChildSession(request: Request): { childId: string } | null {
    const cookies = request.headers.get('cookie')
    if (!cookies) return null

    const sessionCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith(`${this.CHILD_SESSION_COOKIE}=`))

    if (!sessionCookie) return null

    try {
      const sessionData = JSON.parse(
        sessionCookie.split('=')[1]
      )
      
      if (Date.now() - sessionData.timestamp > 86400000) {
        return null
      }

      return { childId: sessionData.childId }
    } catch {
      return null
    }
  }
}