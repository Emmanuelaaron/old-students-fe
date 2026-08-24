import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { Contribution, Member } from "@/redux";
import { selectFineAmount, selectMonthlyContribution, useAppSelector } from "@/redux";
import { fmtDate, fmtMonth, fmtUGX } from "@/app/utils/format";

export function FinesTab({
  members,
  unpaidFines,
  onMarkFinePaid,
  loadingId,
}: {
  members: Member[];
  unpaidFines: Contribution[];
  onMarkFinePaid: (id: string) => void;
  loadingId?: string | null;
}) {
  const monthlyContribution = useAppSelector(selectMonthlyContribution);
  const fineAmount = useAppSelector(selectFineAmount);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4">Outstanding Fines</Typography>
      <Alert severity="warning">
        Fine = 10% × {fmtUGX(monthlyContribution)} = <strong>{fmtUGX(fineAmount)}</strong> — applies when
        paid after 5th of the following month.
      </Alert>

      {unpaidFines.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography color="text.secondary">No outstanding fines</Typography>
        </Paper>
      ) : (
        <Paper sx={{ overflow: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "warning.dark" }}>
                {["Member", "Month", "Paid On (Late)", "Fine Amount", "Action"].map(h => (
                  <TableCell key={h} sx={{ color: "common.white", fontWeight: 700 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {unpaidFines.map(c => {
                const m = members.find(x => x.id === c.memberId);
                return (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {m ? `${m.firstName} ${m.lastName}` : c.memberId}
                      </Typography>
                    </TableCell>
                    <TableCell>{fmtMonth(c.month)}</TableCell>
                    <TableCell>{fmtDate(c.paidAt)}</TableCell>
                    <TableCell>
                      <Typography color="warning.main" fontWeight={800}>
                        {fmtUGX(c.fineAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const isLoading = loadingId === c.id;
                        return (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => onMarkFinePaid(c.id)}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
                          >
                            {isLoading ? "Mark…" : "Mark Paid"}
                          </Button>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
