import { useEffect } from "react";
import { Box, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { fetchRoleHistory, selectRoleHistory, selectRoleHistoryStatus, useAppDispatch, useAppSelector } from "@/redux";
import { fmtDate } from "@/app/utils/format";

export function RoleHistoryTab() {
  const dispatch = useAppDispatch();
  const history = useAppSelector(selectRoleHistory);
  const status = useAppSelector(selectRoleHistoryStatus);

  useEffect(() => {
    void dispatch(fetchRoleHistory());
  }, [dispatch]);

  if (status === "loading" && history.length === 0) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const formatRole = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4">Role History</Typography>
      <Paper sx={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {["Member", "Role", "Started", "Ended", "Appointed by"].map(h => (
                <TableCell key={h} sx={{ color: "common.white", fontWeight: 700 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map(h => (
              <TableRow key={h.id} hover>
                <TableCell>{h.member?.fullName}</TableCell>
                <TableCell>{formatRole(h.role)}</TableCell>
                <TableCell>{fmtDate(h.startedAt)}</TableCell>
                <TableCell>{h.endedAt ? fmtDate(h.endedAt) : "Current"}</TableCell>
                <TableCell>{h.appointedBy?.fullName}</TableCell>
              </TableRow>
            ))}
            {history.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  No role changes recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
