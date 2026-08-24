import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
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
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const months = useMemo(
    () => Array.from(new Set(contributions.map(c => c.month))).sort().reverse(),
    [contributions]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...contributions]
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
      .filter(c => {
        const m = members.find(x => x.id === c.memberId);
        const name = m ? `${m.firstName} ${m.lastName}`.toLowerCase() : c.memberId.toLowerCase();
        const matchesSearch = !q || name.includes(q);
        const matchesMember = !memberFilter || String(c.memberId) === memberFilter;
        const matchesMonth = !monthFilter || c.month === monthFilter;
        return matchesSearch && matchesMember && matchesMonth;
      });
  }, [contributions, members, search, memberFilter, monthFilter]);

  const pageCount = Math.ceil(filtered.length / rowsPerPage) || 1;
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

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

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          label="Search member"
          size="small"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(0);
          }}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: 160 }} fullWidth>
          <InputLabel>Member</InputLabel>
          <Select
            value={memberFilter}
            label="Member"
            onChange={e => {
              setMemberFilter(e.target.value as string);
              setPage(0);
            }}
          >
            <MenuItem value="">All members</MenuItem>
            {members
              .slice()
              .sort((a, b) => a.lastName.localeCompare(b.lastName))
              .map(m => (
                <MenuItem key={m.id} value={String(m.id)}>
                  {m.firstName} {m.lastName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }} fullWidth>
          <InputLabel>Month</InputLabel>
          <Select
            value={monthFilter}
            label="Month"
            onChange={e => {
              setMonthFilter(e.target.value as string);
              setPage(0);
            }}
          >
            <MenuItem value="">All months</MenuItem>
            {months.map(m => (
              <MenuItem key={m} value={m}>
                {fmtMonth(m)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

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
            {paged.map(c => {
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  No contributions recorded yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={safePage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Stack>
  );
}
