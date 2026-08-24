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
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import type { Contribution, Member } from "@/redux";
import { selectFineAmount, useAppSelector } from "@/redux";
import { fmtDate, fmtMonth, fmtUGX } from "@/app/utils/format";
import { ProofOfPaymentButton } from "@/app/components/ProofOfPaymentButton";

export function PaymentReportsTab({
  members,
  pendingReports,
  onApprove,
  onReject,
  loadingId,
}: {
  members: Member[];
  pendingReports: Contribution[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loadingId?: string | null;
}) {
  const fineAmount = useAppSelector(selectFineAmount);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4">Payment Reports</Typography>
      <Alert severity="info">
        Members can report their own contributions with proof of payment. Approve to confirm, or
        reject so they can resubmit. Late fine is {fmtUGX(fineAmount)} when paid after the 5th of the
        following month.
      </Alert>

      {pendingReports.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography color="text.secondary">No payment reports awaiting approval</Typography>
        </Paper>
      ) : (
        <Paper sx={{ overflow: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                {["Member", "Month", "Paid On", "Amount", "Fine", "Proof", "Actions"].map(h => (
                  <TableCell key={h} sx={{ color: "common.white", fontWeight: 700 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingReports.map(c => {
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
                      {c.hasProof && c.proofUrl ? (
                        <ProofOfPaymentButton proofUrl={c.proofUrl} />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const isLoading = loadingId === c.id;
                        return (
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <HowToRegIcon />}
                              onClick={() => onApprove(c.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? "Approve…" : "Approve"}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <PersonOffIcon />}
                              onClick={() => onReject(c.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? "Reject…" : "Reject"}
                            </Button>
                          </Stack>
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
