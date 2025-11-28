'use client';

import { useState, useTransition } from 'react';
import { Crown, Plus, Edit2, Trash2, User, Mail, Building, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addVIPAction } from '@/actions/vip/addVIP';
import { updateVIPAction } from '@/actions/vip/updateVIP';
import { deleteVIPAction } from '@/actions/vip/deleteVIP';
import toast from 'react-hot-toast';

interface VIPParticipant {
  id: string;
  name: string;
  email: string;
  company: string | null;
  vipLevel: number;
  guestOf: string | null;
  guestOfName: string | null;
  guestOfEmail: string | null;
  vipNote: string | null;
  status: string;
}

interface VIPClientProps {
  eventId: string;
  vipParticipants: VIPParticipant[];
}

interface VIPFormData {
  participantId: string;
  participantName: string;
  participantEmail: string;
  vipLevel: number;
  guestOf: string | null;
  vipNote: string;
}

export default function VIPClient({ eventId, vipParticipants: initialVIPs }: VIPClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVIP, setEditingVIP] = useState<VIPParticipant | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<VIPFormData>({
    participantId: '',
    participantName: '',
    participantEmail: '',
    vipLevel: 1,
    guestOf: null,
    vipNote: '',
  });

  const [searchQuery, setSearchQuery] = useState('');

  // 검색 필터링
  const filteredVIPs = initialVIPs.filter((vip) => {
    const query = searchQuery.toLowerCase();
    return (
      vip.name.toLowerCase().includes(query) ||
      vip.email.toLowerCase().includes(query) ||
      (vip.company && vip.company.toLowerCase().includes(query))
    );
  });

  const handleOpenModal = (vip?: VIPParticipant) => {
    if (vip) {
      setEditingVIP(vip);
      setFormData({
        participantId: vip.id,
        participantName: vip.name,
        participantEmail: vip.email,
        vipLevel: vip.vipLevel,
        guestOf: vip.guestOf,
        vipNote: vip.vipNote || '',
      });
    } else {
      setEditingVIP(null);
      setFormData({
        participantId: '',
        participantName: '',
        participantEmail: '',
        vipLevel: 1,
        guestOf: null,
        vipNote: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVIP(null);
    setFormData({
      participantId: '',
      participantName: '',
      participantEmail: '',
      vipLevel: 1,
      guestOf: null,
      vipNote: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.participantId) {
      toast.error('참가자를 선택해주세요.');
      return;
    }

    startTransition(async () => {
      try {
        const action = editingVIP ? updateVIPAction : addVIPAction;
        const result = await action({
          eventId,
          participantId: formData.participantId,
          vipLevel: formData.vipLevel,
          guestOf: formData.guestOf || null,
          vipNote: formData.vipNote || null,
        });

        if (result.success) {
          toast.success(result.message || 'VIP가 성공적으로 저장되었습니다.');
          handleCloseModal();
          window.location.reload();
        } else {
          toast.error(result.message || 'VIP 저장 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('VIP save error:', error);
        toast.error(error?.message || 'VIP 저장 중 오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = (vip: VIPParticipant) => {
    if (!confirm(`"${vip.name}" 님의 VIP 등급을 제거하시겠습니까?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteVIPAction({
          eventId,
          participantId: vip.id,
        });

        if (result.success) {
          toast.success(result.message || 'VIP가 성공적으로 제거되었습니다.');
          window.location.reload();
        } else {
          toast.error(result.message || 'VIP 제거 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('VIP delete error:', error);
        toast.error(error?.message || 'VIP 제거 중 오류가 발생했습니다.');
      }
    });
  };

  const getVIPLevelLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: 'VIP 1',
      2: 'VIP 2',
      3: 'VIP 3',
    };
    return labels[level] || '일반';
  };

  const getVIPLevelColor = (level: number) => {
    const colors: Record<number, string> = {
      1: 'bg-amber-100 text-amber-700',
      2: 'bg-orange-100 text-orange-700',
      3: 'bg-red-100 text-red-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  // VIP 등급별 참가자 목록 (guest_of 선택용)
  const vipHosts = initialVIPs.filter((vip) => vip.vipLevel > 0 && !vip.guestOf);

  return (
    <div className="space-y-6">
      {/* 헤더 및 액션 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">VIP 목록</h2>
          <p className="text-sm text-gray-500 mt-1">
            총 {filteredVIPs.length}명의 VIP 참가자
          </p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          VIP 추가
        </Button>
      </div>

      {/* 검색 */}
      <div>
        <Input
          label="검색"
          placeholder="이름, 이메일, 회사명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* VIP 테이블 */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          {filteredVIPs.length === 0 ? (
            <div className="p-12 text-center">
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">등록된 VIP가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      등급
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      동반자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      비고
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVIPs.map((vip) => (
                    <tr key={vip.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{vip.name}</span>
                        </div>
                        {vip.company && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {vip.company}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {vip.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {vip.vipLevel > 0 ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getVIPLevelColor(
                              vip.vipLevel
                            )}`}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {getVIPLevelLabel(vip.vipLevel)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">동반자</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {vip.guestOfName ? (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{vip.guestOfName}</span>
                            {vip.guestOfEmail && (
                              <div className="text-xs text-gray-500">{vip.guestOfEmail}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {vip.vipNote ? (
                          <span className="text-sm text-gray-600">{vip.vipNote}</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(vip)}
                            disabled={isPending}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vip)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VIP 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                {editingVIP ? 'VIP 정보 수정' : 'VIP 추가'}
              </CardTitle>
              <CardDescription>
                {editingVIP
                  ? 'VIP 정보를 수정하세요.'
                  : '참가자를 선택하고 VIP 등급을 설정하세요.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingVIP && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      참가자 검색
                    </label>
                    <Input
                      placeholder="참가자 이름 또는 이메일로 검색..."
                      value={formData.participantName}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          participantName: e.target.value,
                          participantEmail: e.target.value,
                        }));
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      * 참가자 검색 기능은 향후 구현 예정입니다. 현재는 participantId를 직접 입력해야 합니다.
                    </p>
                    <Input
                      label="참가자 ID"
                      value={formData.participantId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, participantId: e.target.value }))
                      }
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIP 등급 *
                  </label>
                  <select
                    value={formData.vipLevel}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, vipLevel: parseInt(e.target.value) }))
                    }
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value={1}>VIP 1</option>
                    <option value={2}>VIP 2</option>
                    <option value={3}>VIP 3</option>
                  </select>
                </div>

                {vipHosts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      동반자 (선택)
                    </label>
                    <select
                      value={formData.guestOf || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          guestOf: e.target.value || null,
                        }))
                      }
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">없음 (독립 VIP)</option>
                      {vipHosts.map((host) => (
                        <option key={host.id} value={host.id}>
                          {host.name} ({host.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비고</label>
                  <textarea
                    value={formData.vipNote}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, vipNote: e.target.value }))
                    }
                    className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="VIP 관련 특별 사항을 입력하세요."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={handleCloseModal}>
                    취소
                  </Button>
                  <Button type="submit" variant="primary" disabled={isPending}>
                    {isPending ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

