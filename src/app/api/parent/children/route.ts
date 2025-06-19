import { NextRequest, NextResponse } from 'next/server'
import { ParentAuth, ChildAuth } from '@/lib/auth'
import { z } from 'zod'

const createChildSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  name: z.string().min(1).max(50),
  ageGroup: z.enum(['kids', 'tweens']),
  pin: z.string().length(4).regex(/^\d+$/),
  avatarUrl: z.string().url().optional()
})

export async function GET(request: NextRequest) {
  try {
    const user = await ParentAuth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const children = await ChildAuth.getChildrenByParent(user.id)
    
    return NextResponse.json({
      children: children.map(child => ({
        id: child.id,
        username: child.username,
        name: child.name,
        ageGroup: child.age_group,
        avatarUrl: child.avatar_url,
        parentalConsent: child.parental_consent,
        createdAt: child.created_at
      }))
    })
  } catch (error) {
    console.error('Get children error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ParentAuth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure parent account exists
    let parent = await ParentAuth.getParentAccount(user.id)
    if (!parent) {
      parent = await ParentAuth.createParentAccount(user.id, user.email!)
    }

    const body = await request.json()
    const childData = createChildSchema.parse(body)

    const child = await ChildAuth.createChildProfile({
      parentId: parent.id,
      username: childData.username,
      name: childData.name,
      ageGroup: childData.ageGroup,
      pin: childData.pin,
      avatarUrl: childData.avatarUrl
    })

    return NextResponse.json({
      success: true,
      child: {
        id: child.id,
        username: child.username,
        name: child.name,
        ageGroup: child.age_group,
        avatarUrl: child.avatar_url,
        parentalConsent: child.parental_consent
      }
    })
  } catch (error) {
    console.error('Create child error:', error)
    return NextResponse.json(
      { error: 'Failed to create child profile' },
      { status: 400 }
    )
  }
}