import { useState } from "react";
import { Box, Button, Container, Stack, Tab, Tabs } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import type { Contribution, Member } from "@/redux";
import { OverviewTab } from "./tabs/OverviewTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { FinesTab } from "./tabs/FinesTab";
import { ReportContributionDialog } from "./ReportContributionDialog";

type MemberTab = "overview" | "profile" | "history" | "fines";
const MEMBER_TABS: MemberTab[] = ["overview", "profile", "history", "fines"];

export function MemberDashboardPage({
  user,
  contributions,
  onReportContribution,
}: {
  user: Member;
  contributions: Contribution[];
  onReportContribution: (months: string[], paidAt: string, proof: File) => Promise<string | null>;
}) {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();
  const [reportOpen, setReportOpen] = useState(false);
  const memberTab: MemberTab = MEMBER_TABS.includes(tab as MemberTab)
    ? (tab as MemberTab)
    : "overview";

  useEffect(() => {
    if (!MEMBER_TABS.includes(tab as MemberTab)) {
      navigate("/dashboard/overview", { replace: true });
    }
  }, [tab, navigate]);

  const myFines = contributions.filter(
    c => c.memberId === user.id && c.status === "approved" && c.hasFine && !c.finePaid
  );

  const tabs: { key: MemberTab; label: string }[] = [
    { key: "overview", label: "Dashboard" },
    { key: "profile", label: "My Profile" },
    { key: "history", label: "Contributions" },
    { key: "fines", label: myFines.length ? `Fines (${myFines.length})` : "Fines" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 64,
          zIndex: 10,
        }}
      >
        <Container maxWidth="md">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Tabs
                value={memberTab}
                onChange={(_, v: MemberTab) => navigate(`/dashboard/${v}`)}
                variant="scrollable"
                scrollButtons="auto"
                textColor="secondary"
                indicatorColor="secondary"
              >
                {tabs.map(t => (
                  <Tab key={t.key} value={t.key} label={t.label} />
                ))}
              </Tabs>
            </Box>
            {user.role !== "member" && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => navigate("/admin")}
              >
                Admin Dashboard
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {memberTab === "overview" && (
          <OverviewTab user={user} contributions={contributions} onReport={() => setReportOpen(true)} />
        )}
        {memberTab === "profile" && <ProfileTab user={user} contributions={contributions} />}
        {memberTab === "history" && (
          <HistoryTab
            user={user}
            contributions={contributions}
            onReport={() => setReportOpen(true)}
          />
        )}
        {memberTab === "fines" && <FinesTab user={user} contributions={contributions} />}
      </Container>

      <ReportContributionDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={onReportContribution}
        user={user}
        contributions={contributions}
      />
    </Box>
  );
}
