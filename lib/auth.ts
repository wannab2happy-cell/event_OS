import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function assertAdminAuth() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    redirect('/admin/login');
  }

  return session;
}

/**
 * 현재 유저 정보와 역할 가져오기
 */
export async function getCurrentUserWithRole() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  // user_metadata에서 role 가져오기 (기본값: 'staff')
  const role = session.user.user_metadata?.role || 'staff';

  return {
    user: session.user,
    role,
    email: session.user.email,
    id: session.user.id,
  };
}

/**
 * Staff 권한 체크 (staff 또는 lead만 통과)
 */
export async function assertStaffAuth() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    redirect('/admin/login');
  }

  // user_metadata에서 role 가져오기
  const role = session.user.user_metadata?.role || 'staff';

  // admin은 staff 권한으로 접근하지 않음
  if (role === 'admin') {
    redirect('/admin/dashboard');
  }

  // staff 또는 lead만 통과
  if (role !== 'staff' && role !== 'lead') {
    redirect('/admin/login');
  }

  return {
    user: session.user,
    role,
    email: session.user.email,
    id: session.user.id,
  };
}

/**
 * 특정 이벤트에 대한 Staff 권한 체크
 */
export async function assertEventStaffAuth(eventId: string) {
  const userInfo = await assertStaffAuth();

  // event_staff 테이블에서 권한 확인
  const { data: eventStaff, error } = await supabaseAdmin
    .from('event_staff')
    .select('id, role')
    .eq('event_id', eventId)
    .eq('user_id', userInfo.id)
    .single();

  if (error || !eventStaff) {
    // 권한 없음 - 403 또는 리다이렉트
    redirect('/admin/login?error=no_access');
  }

  return {
    ...userInfo,
    eventRole: eventStaff.role,
  };
}

