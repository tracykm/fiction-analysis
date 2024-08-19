import { Box, Tooltip, Typography } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";

export function HelpTooltip({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <Tooltip title={title}>
      <div>
        <HelpOutline sx={{ height: 16, mt: 0.75 }} />
      </div>
    </Tooltip>
  );
}
