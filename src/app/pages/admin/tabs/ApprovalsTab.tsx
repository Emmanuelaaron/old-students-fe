import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import CakeIcon from "@mui/icons-material/Cake";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import WcIcon from "@mui/icons-material/Wc";
import BadgeIcon from "@mui/icons-material/Badge";
import type { Member } from "@/redux";
import { DetailField } from "@/app/components/DetailField";
import { fmtDate } from "@/app/utils/format";

export function ApprovalsTab({
  pending,
  onApprove,
  onReject,
  loadingId,
}: {
  pending: Member[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loadingId?: string | null;
}) {
  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Pending Approvals</Typography>
        <Typography color="text.secondary">{pending.length} pending</Typography>
      </Stack>

      {pending.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography color="text.secondary">No pending registrations</Typography>
        </Paper>
      ) : (
        pending.map(m => (
          <Paper key={m.id} sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <Box
                sx={{
                  flex: 1,
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <DetailField icon={<BadgeIcon fontSize="inherit" color="secondary" />} label="Full Name" value={`${m.firstName} ${m.lastName}`} />
                <DetailField icon={<WorkIcon fontSize="inherit" color="secondary" />} label="Occupation" value={m.occupation} />
                <DetailField icon={<PhoneIcon fontSize="inherit" color="secondary" />} label="Tel. Contact" value={m.tel} />
                <DetailField icon={<CakeIcon fontSize="inherit" color="secondary" />} label="Date of Birth" value={fmtDate(m.dateOfBirth)} />
                <DetailField icon={<WcIcon fontSize="inherit" color="secondary" />} label="Gender" value={m.gender} />
                <DetailField icon={<EmailIcon fontSize="inherit" color="secondary" />} label="Email" value={m.email} />
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <DetailField icon={<HomeIcon fontSize="inherit" color="secondary" />} label="Address" value={m.address} />
                </Box>
              </Box>
              <Stack spacing={1}>
                {(() => {
                  const isLoading = loadingId === m.id;
                  return (
                    <>
                      <Button
                        variant="contained"
                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <HowToRegIcon />}
                        onClick={() => onApprove(m.id)}
                        disabled={isLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <PersonOffIcon />}
                        onClick={() => onReject(m.id)}
                        disabled={isLoading}
                      >
                        Reject
                      </Button>
                    </>
                  );
                })()}
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
              Registered {fmtDate(m.joinedAt)}
            </Typography>
          </Paper>
        ))
      )}
    </Stack>
  );
}
