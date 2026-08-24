import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { Contribution, Member } from "@/redux";
import { StatusChip } from "@/app/components/StatusChip";
import { fmtDate, fmtMonth, fmtUGX } from "@/app/utils/format";

export function FinesTab({
  user,
  contributions,
}: {
  user: Member;
  contributions: Contribution[];
}) {
  const myContribs = contributions.filter(c => c.memberId === user.id && c.status === "approved");
  const myFines = myContribs.filter(c => c.hasFine && !c.finePaid);
  const settled = myContribs.filter(c => c.hasFine && c.finePaid);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4">My Fines</Typography>

      {myFines.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <EmojiEventsIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography fontWeight={700}>No outstanding fines</Typography>
          <Typography color="text.secondary">Excellent — keep paying on time!</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {myFines.map(c => (
            <Paper key={c.id} sx={{ p: 2.5, borderColor: "warning.light", borderWidth: 1, borderStyle: "solid" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight={800}>{fmtMonth(c.month)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Paid on {fmtDate(c.paidAt)} — after the 5th of following month
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography color="warning.main" fontWeight={800} fontSize={18}>
                    {fmtUGX(c.fineAmount)}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Outstanding
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
          <Alert severity="warning">Please contact the administrator to settle your outstanding fines.</Alert>
        </Stack>
      )}

      {settled.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.12em">
            SETTLED FINES
          </Typography>
          {settled.map(c => (
            <Paper key={c.id} sx={{ p: 2, opacity: 0.65 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight={700}>{fmtMonth(c.month)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Paid {fmtDate(c.paidAt)}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography sx={{ textDecoration: "line-through", color: "text.disabled" }} fontWeight={700}>
                    {fmtUGX(c.fineAmount)}
                  </Typography>
                  <StatusChip variant="success" label="Settled" />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
