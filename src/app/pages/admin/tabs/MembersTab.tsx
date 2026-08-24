import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { Member } from "@/redux";
import { MEMBER_ROLES } from "@/redux";
import { StatusChip } from "@/app/components/StatusChip";
import { fmtDate } from "@/app/utils/format";
import { useAppDispatch } from "@/redux";
import { assignMemberRole, fetchApprovedMembers } from "@/redux";

type ConfirmState = {
  member: Member;
  role: string;
  currentHolder: Member | null;
} | null;

export function MembersTab({ approved }: { approved: Member[] }) {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const filtered = approved.filter(
    m =>
      search === "" ||
      `${m.firstName} ${m.lastName} ${m.occupation} ${m.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const findCurrentHolder = (member: Member, role: string) =>
    role === "member" ? null : approved.find(m => m.id !== member.id && m.role === role) || null;

  const handleRoleChange = (member: Member, role: string) => {
    if (role === member.role) return;
    const currentHolder = findCurrentHolder(member, role);
    setConfirm({ member, role, currentHolder });
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    const { member, role, currentHolder } = confirm;
    setSaving(member.id);
    setConfirm(null);

    const result = await dispatch(
      assignMemberRole({
        id: member.id,
        role: role as Member["role"],
        force: currentHolder !== null,
      })
    );
    setSaving(null);

    if (assignMemberRole.fulfilled.match(result)) {
      await dispatch(fetchApprovedMembers());
    } else if (assignMemberRole.rejected.match(result)) {
      const payload = result.payload as { needsConfirmation?: boolean; currentHolder?: { fullName: string } } | undefined;
      if (payload?.needsConfirmation && payload?.currentHolder) {
        setConfirm({
          member,
          role,
          currentHolder: { firstName: payload.currentHolder.fullName.split(" ")[0], lastName: payload.currentHolder.fullName.split(" ").slice(1).join(" "), fullName: payload.currentHolder.fullName, id: "", role } as Member,
        });
      }
    }
  };

  const formatRole = (role: string) =>
    role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
        <Typography variant="h4">All Members</Typography>
        <TextField
          size="small"
          placeholder="Search members…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 280 } }}
        />
      </Stack>

      <Paper sx={{ overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {["Name", "Occupation", "Gender", "Contact", "Joined", "Role"].map(h => (
                <TableCell key={h} sx={{ color: "common.white", fontWeight: 700 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(m => (
              <TableRow key={m.id} hover>
                <TableCell>
                  <Typography fontWeight={700}>
                    {m.firstName} {m.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.email}
                  </Typography>
                </TableCell>
                <TableCell>{m.occupation}</TableCell>
                <TableCell>{m.gender}</TableCell>
                <TableCell>{m.tel}</TableCell>
                <TableCell>{fmtDate(m.joinedAt)}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={m.role}
                    disabled={saving === m.id}
                    onChange={e => handleRoleChange(m, e.target.value)}
                    renderValue={value => (
                      <StatusChip
                        variant={value === "chairperson" ? "navy" : "success"}
                        label={formatRole(String(value))}
                      />
                    )}
                    sx={{ minWidth: 160 }}
                  >
                    {MEMBER_ROLES.map(role => (
                      <MenuItem key={role} value={role}>
                        {formatRole(role)}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(confirm)} onClose={() => !saving && setConfirm(null)}>
        <DialogTitle>Update role?</DialogTitle>
        <DialogContent>
          {confirm && (
            <>
              <Typography sx={{ mb: 1 }}>
                Are you sure you want to make{" "}
                <strong>{confirm.member.firstName} {confirm.member.lastName}</strong> the{" "}
                <strong>{formatRole(confirm.role)}</strong>?
              </Typography>
              {confirm.currentHolder && (
                <Alert severity="warning">
                  <strong>{confirm.currentHolder.firstName} {confirm.currentHolder.lastName}</strong> is currently the{" "}
                  <strong>{formatRole(confirm.role)}</strong>. If you continue, they will become a regular member.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} color="primary" disabled={Boolean(saving)}>
            No, cancel
          </Button>
          <Button onClick={handleConfirm} color="secondary" variant="contained" disabled={Boolean(saving)}>
            Yes, update
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
