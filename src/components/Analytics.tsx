import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockData = [
  { date: '2024-01', transactions: 65 },
  { date: '2024-02', transactions: 78 },
  { date: '2024-03', transactions: 90 },
  { date: '2024-04', transactions: 81 },
  { date: '2024-05', transactions: 95 },
];

const auditLogs = [
  { id: 1, event: 'Will Created', address: '0x1234...5678', timestamp: '2024-05-01 14:30' },
  { id: 2, event: 'Asset Transfer', address: '0x8765...4321', timestamp: '2024-05-01 15:45' },
  { id: 3, event: 'NFT Claimed', address: '0x9876...1234', timestamp: '2024-05-02 09:15' },
];

export function Analytics() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Transaction Analytics</h2>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(5)} // Show only month
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Audit Logs</h2>
        <ScrollArea className="h-[250px] sm:h-[300px]">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="hidden sm:table-cell">Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.event}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono">{log.address}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}