'use client';

import { useState, useTransition } from 'react';
import { Users, UserPlus, Trash2, Mail, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addEventStaffAction } from '@/actions/staff/addEventStaff';
import { removeEventStaffAction } from '@/actions/staff/removeEventStaff';
import toast from 'react-hot-toast';

interface StaffMember {
  id: string;
  userId: string;
  role: string;
  email: string;
  name: string;
  createdAt: string;
}

interface StaffEventManageClientProps {
  eventId: string;
  staffList: StaffMember[];
}

export default function StaffEventManageClient({
  eventId,
  staffList: initialStaffList,
}: StaffEventManageClientProps) {
  const [staffList, setStaffList] = useState(initialStaffList);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'staff' | 'lead'>('staff');
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    startTransition(async () => {
      const result = await addEventStaffAction({
        eventId,
        email: email.trim(),
        role,
      });

      if (result.success) {
        toast.success(result.message);
        setEmail('');
        // 페이지 새로고침으로 최신 데이터 로드
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleRemove = (userId: string, staffEmail: string) => {
    if (!confirm(`${staffEmail} 스태프를 제거하시겠습니까?`)) {
      return;
    }

    startTransition(async () => {
      const result = await removeEventStaffAction({
        eventId,
        userId,
      });

      if (result.success) {
        toast.success(result.message);
        // 페이지 새로고침으로 최신 데이터 로드
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 현재 Staff 리스트 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            현재 Staff 리스트
          </CardTitle>
          <CardDescription>이 이벤트에 할당된 스태프 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {staffList.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>할당된 스태프가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{staff.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            staff.role === 'lead'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {staff.role === 'lead' ? 'Lead' : 'Staff'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3" />
                        {staff.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(staff.userId, staff.email)}
                    disabled={isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff 추가 폼 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Staff 추가
          </CardTitle>
          <CardDescription>이메일로 스태프를 검색하여 이벤트에 할당하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="이메일"
                type="email"
                placeholder="staff@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'staff' | 'lead')}
                disabled={isPending}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="staff">Staff</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={isPending || !email.trim()} className="w-full">
            {isPending ? '추가 중...' : 'Staff 추가'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

