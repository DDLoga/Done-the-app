// component used in new task organizer
import React from 'react';
import { FormControl, InputLabel, Select, OutlinedInput, MenuItem } from '@mui/material';
import { commonStyles } from './_commonStyles';

const StatusSelect = ({ value, onChange }) => (
    <FormControl variant="outlined" sx={{ ...commonStyles, minWidth: 80 }}>
        <InputLabel id="status-label">Status</InputLabel>
        <Select
            labelId="status-label"
            value={value}
            onChange={onChange}
            label="Status"
            input={<OutlinedInput label="Status" />}
        >
            <MenuItem value="Co">Completed</MenuItem>
            <MenuItem value="Cn">Cancelled</MenuItem>
            <MenuItem value="De">Delegated</MenuItem>
            <MenuItem value="Ip">In Process</MenuItem>
            <MenuItem value="Ns">Not Started</MenuItem>
            <MenuItem value="Wa">Wait for</MenuItem>
        </Select>
    </FormControl>
);

export default StatusSelect;