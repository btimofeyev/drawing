import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = supabaseAdmin
  
  // Check if table exists and get column info
  const { data: tableInfo, error: tableError } = await supabase
    .from('daily_upload_limits')
    .select('*')
    .limit(0)
  
  if (tableError) {
    return NextResponse.json({ 
      error: 'Table query error',
      details: tableError 
    }, { status: 500 })
  }
  
  // Get column information from information_schema
  const { data: columns, error: columnsError } = await supabase
    .rpc('get_table_columns', { table_name: 'daily_upload_limits' })
    .select('*')
  
  if (columnsError) {
    // Try a simpler query
    const { data: sampleData, error: sampleError } = await supabase
      .from('daily_upload_limits')
      .select('*')
      .limit(1)
    
    return NextResponse.json({
      tableExists: !sampleError,
      sampleError,
      sampleData,
      message: 'Could not get column info, showing sample data instead'
    })
  }
  
  return NextResponse.json({
    tableExists: true,
    columns
  })
}