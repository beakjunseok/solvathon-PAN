import React from 'react';

interface NoClassDayCellProps {
  name: string;
  rowSpan: number;
}

export const NoClassDayCell: React.FC<NoClassDayCellProps> = ({ name, rowSpan }) => (
  <td
    rowSpan={rowSpan}
    className="p-2 border border-yellow-300 bg-yellow-100 text-yellow-900 text-center align-middle break-keep"
  >
    <span className="block text-xs font-bold">{name}</span>
    <span className="block text-[11px] mt-0.5">수업 없음</span>
  </td>
);
