import { useEffect } from "react";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  fetchAdminDashboard,
  selectAdminDashboard,
  selectAdminDashboardStatus,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import { fmtMonth, fmtUGX } from "@/app/utils/format";
import { StatusChip } from "@/app/components/StatusChip";

export function OverviewTab() {
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector(selectAdminDashboard);
  const status = useAppSelector(selectAdminDashboardStatus);

  useEffect(() => {
    void dispatch(fetchAdminDashboard());
  }, [dispatch]);

  if (status === "loading" && !dashboard) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Typography color="text.secondary">Unable to load live dashboard data.</Typography>
    );
  }

  const cards = [
    {
      label: "Total Members",
      value: dashboard.totalMembers,
      icon: <GroupsIcon />,
      color: "#1b2d5e",
      bg: "#eef2f8",
    },
    {
      label: "Pending Approvals",
      value: dashboard.pendingApprovals,
      icon: <AccessTimeIcon />,
      color: "#c8991a",
      bg: "#fef9ec",
    },
    {
      label: "Collected This Month",
      value: fmtUGX(dashboard.collectedThisMonth),
      icon: <PaymentsIcon />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "Outstanding Fines",
      value: dashboard.outstandingFines,
      icon: <WarningAmberIcon />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      label: `Annual Subs Collected (${dashboard.currentYear})`,
      value: fmtUGX(dashboard.collectedAnnualSubscriptions),
      icon: <PaymentsIcon />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: `Unpaid Annual Subs`,
      value: dashboard.unpaidAnnualSubscribers,
      icon: <WarningAmberIcon />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Dashboard Overview</Typography>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          // gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(6, 1fr)" },
          gridTemplateColumns:[["1fr","1fr 1fr", "1fr 1fr 1fr"]]
        }}
      >
        {cards.map(c => (
          <Paper key={c.label} sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.1em">
                {c.label.toUpperCase()}
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: c.bg,
                  color: c.color,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {c.icon}
              </Box>
            </Stack>
            <Typography variant="h5" sx={{ color: c.color, fontWeight: 800 }}>
              {c.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {dashboard.notPaidThisMonth.length > 0 && (
        <Paper>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography fontWeight={700}>Not Paid for {fmtMonth(dashboard.month)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {dashboard.notPaidThisMonth.length} member(s)
            </Typography>
          </Box>
          {dashboard.notPaidThisMonth.map(m => (
            <Stack
              key={m.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ px: 3, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Box>
                <Typography fontWeight={700}>
                  {m.firstName} {m.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {m.occupation}
                </Typography>
              </Box>
              <StatusChip variant="danger" label="Unpaid" />
            </Stack>
          ))}
        </Paper>
      )}
    </Stack>
  );
}
