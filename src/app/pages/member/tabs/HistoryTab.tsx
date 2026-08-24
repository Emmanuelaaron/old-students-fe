import {
  Alert,
  Box,
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
import { getMonthsFrom, isPastDue, selectFineAmount, selectMonthlyContribution, useAppSelector } from "@/redux";
import { StatusChip } from "@/app/components/StatusChip";
import { ProofOfPaymentButton } from "@/app/components/ProofOfPaymentButton";
import { fmtDate, fmtMonth, fmtUGX } from "@/app/utils/format";

export function HistoryTab({
  user,
  contributions,
  onReport,
}: {
  user: Member;
  contributions: Contribution[];
  onReport?: () => void;
}) {
  const monthlyContribution = useAppSelector(selectMonthlyContribution);
  const fineAmount = useAppSelector(selectFineAmount);
  const myContribs = contributions.filter(c => c.memberId === user.id);
  const allMonths = getMonthsFrom(user.joinedAt);

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4">Contribution History</Typography>
          <Typography color="text.secondary">{fmtUGX(monthlyContribution)}/month</Typography>
        </Box>
        {onReport && (
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={onReport}>
            Report Contribution
          </Button>
        )}
      </Stack>

      <Alert severity="warning">
        Payments made after the 5th of the following month incur a 10% fine ({fmtUGX(fineAmount)}).
      </Alert>

      <Paper sx={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {["Month", "Amount", "Paid On", "Fine", "Status", "Proof"].map(h => (
                <TableCell key={h} sx={{ color: "common.white", fontWeight: 700 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...allMonths].reverse().map(month => {
              const c = myContribs.find(x => x.month === month);
              const overdue = isPastDue(month);
              return (
                <TableRow key={month} hover>
                  <TableCell>
                    <Typography fontWeight={700}>{fmtMonth(month)}</Typography>
                  </TableCell>
                  <TableCell>{c ? fmtUGX(monthlyContribution) : "—"}</TableCell>
                  <TableCell>{c ? fmtDate(c.paidAt) : "—"}</TableCell>
                  <TableCell>
                    {c?.hasFine ? (
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color: c.finePaid ? "text.disabled" : "warning.main",
                          textDecoration: c.finePaid ? "line-through" : "none",
                        }}
                      >
                        {fmtUGX(c.fineAmount)}
                      </Typography>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {c ? (
                      c.status === "pending" ? (
                        <StatusChip variant="warning" label="Awaiting Approval" />
                      ) : c.hasFine && !c.finePaid ? (
                        <StatusChip variant="warning" label="Fine Owed" />
                      ) : (
                        <StatusChip variant="success" label="Paid" />
                      )
                    ) : overdue ? (
                      <StatusChip variant="danger" label="Overdue" />
                    ) : (
                      <StatusChip variant="neutral" label="Due" />
                    )}
                  </TableCell>
                  <TableCell>
                    {c?.hasProof && c.proofUrl ? <ProofOfPaymentButton proofUrl={c.proofUrl} /> : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
