import {
  Alert,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { Contribution, Member } from "@/redux";
import { selectFineAmount, useAppSelector } from "@/redux";
import { StatusChip } from "@/app/components/StatusChip";
import { fmtDate, fmtMonth, fmtUGX } from "@/app/utils/format";

export function ContributionsTab({
  members,
  contributions,
  onOpenRecord,
}: {
  members: Member[];
  contributions: Contribution[];
  onOpenRecord: () => void;
}) {
  const fineAmount = useAppSelector(selectFineAmount);

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
        <Typography variant="h4">Contributions</Typography>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={onOpenRecord}>
          Record Payment
        </Button>
      </Stack>

      <Alert severity="warning">
        Late fine ({fmtUGX(fineAmount)}) applies when payment is recorded after the 5th of the following
        month.
      </Alert>

      <Paper sx={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {["Member", "Month", "Paid On", "Amount", "Fine", "Status"].map(h => (
                <TableCell key={h} sx={{ color: "common.white", fontWeight: 700 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...contributions]
              .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
              .slice(0, 40)
              .map(c => {
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
                      <Typography fontWeight={700}>{fmtUGX(c.amount)}</Typography>
                    </TableCell>
                    <TableCell>
                      {c.hasFine ? (
                        <Typography color="warning.main" fontWeight={700} variant="body2">
                          {fmtUGX(c.fineAmount)}
                        </Typography>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {c.hasFine && !c.finePaid ? (
                        <StatusChip variant="warning" label="Fine Owed" />
                      ) : (
                        <StatusChip variant="success" label="Cleared" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            {contributions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  No contributions recorded yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
