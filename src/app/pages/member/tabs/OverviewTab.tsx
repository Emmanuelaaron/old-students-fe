import { useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { Contribution, Member } from "@/redux";
import {
  fetchMyContributions,
  fetchMyAnnualSubscriptions,
  selectAnnualSubscriptions,
  selectAnnualSubscriptionAmount,
  selectMonthlyContribution,
  useAppDispatch,
  useAppSelector,
} from "@/redux";
import { fmtMonth, fmtUGX, nowYM } from "@/app/utils/format";
import { StatusChip } from "@/app/components/StatusChip";

export function OverviewTab({
  user,
  contributions,
  onReport,
}: {
  user: Member;
  contributions: Contribution[];
  onReport: () => void;
}) {
  const dispatch = useAppDispatch();
  const monthlyContribution = useAppSelector(selectMonthlyContribution);
  const annualAmount = useAppSelector(selectAnnualSubscriptionAmount);
  const annualSubscriptions = useAppSelector(selectAnnualSubscriptions);

  useEffect(() => {
    void dispatch(fetchMyContributions());
    void dispatch(fetchMyAnnualSubscriptions());
  }, [dispatch]);
  const mine = contributions.filter(c => c.memberId === user.id);
  const currentYear = new Date().getFullYear();
  const thisYearSub = annualSubscriptions.find(s => s.year === currentYear);
  const approved = mine.filter(c => c.status === "approved");
  const pending = mine.filter(c => c.status === "pending");
  const fines = approved.filter(c => c.hasFine && !c.finePaid);
  const totalPaid = approved.reduce((s, c) => s + c.amount, 0);
  const thisMonth = nowYM();
  const thisMonthRecord = mine.find(c => c.month === thisMonth);

  const cards = [
    {
      label: "Total Paid",
      value: fmtUGX(totalPaid),
      icon: <PaymentsIcon />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      label: "Months Paid",
      value: approved.length,
      icon: <CheckCircleOutlineIcon />,
      color: "#1b2d5e",
      bg: "#eef2f8",
    },
    {
      label: "Awaiting Approval",
      value: pending.length,
      icon: <HourglassTopIcon />,
      color: "#c8991a",
      bg: "#fef9ec",
    },
    {
      label: "Fines Owed",
      value: fines.length,
      icon: <WarningAmberIcon />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      label: "Annual Subscription",
      value: thisYearSub ? "Paid" : `UGX ${annualAmount.toLocaleString()}`,
      icon: thisYearSub ? <CheckCircleOutlineIcon /> : <WarningAmberIcon />,
      color: thisYearSub ? "#16a34a" : "#dc2626",
      bg: thisYearSub ? "#f0fdf4" : "#fef2f2",
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4">My Dashboard</Typography>
          <Typography color="text.secondary">
            Welcome back, {user.firstName}. Monthly dues are {fmtUGX(monthlyContribution)}.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" onClick={onReport}>
          Report Contribution
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" },
        }}
      >
        {cards.map(c => (
          <Paper key={c.label} sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" mb={1.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">
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

      <Paper sx={{ p: 3 }}>
        <Typography fontWeight={700} gutterBottom>
          {fmtMonth(thisMonth)}
        </Typography>
        {!thisMonthRecord && (
          <Stack spacing={1.5}>
            <Typography color="text.secondary">
              No contribution reported for this month yet.
            </Typography>
            <Button variant="outlined" color="secondary" onClick={onReport} sx={{ alignSelf: "flex-start" }}>
              Report this month&apos;s payment
            </Button>
          </Stack>
        )}
        {thisMonthRecord?.status === "pending" && (
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip variant="warning" label="Pending Approval" />
            <Typography color="text.secondary" variant="body2">
              Your report is waiting for the administrator to confirm.
            </Typography>
          </Stack>
        )}
        {thisMonthRecord?.status === "approved" && (
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip variant="success" label="Paid" />
            <Typography color="text.secondary" variant="body2">
              Contribution recorded{thisMonthRecord.hasFine && !thisMonthRecord.finePaid ? " — fine outstanding" : ""}.
            </Typography>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
