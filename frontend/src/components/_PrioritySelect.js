// component used in new task organizer
import React from 'react';
import { FormControl, InputLabel, Select, OutlinedInput, MenuItem } from '@mui/material';
import { commonStyles } from './_commonStyles';

const PrioritySelect = ({ value, onChange }) => (
    <FormControl variant="outlined" sx={{ ...commonStyles, minWidth: 80 }}>
        <InputLabel id="priority-label">Priority</InputLabel>
        <Select
            labelId="priority-label"
            value={value}
            onChange={onChange}
            label="Priority"
            input={<OutlinedInput label="Priority" />}
        >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="D">D</MenuItem>
        </Select>
    </FormControl>
);

export default PrioritySelect;