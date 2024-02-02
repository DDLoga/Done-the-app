// component used in new task organizer
import React from 'react';
import { TextField } from '@mui/material';
import { commonStyles } from './_commonStyles';

const DatePicker = ({ value, onChange }) => (
    <TextField
        sx={{ ...commonStyles, minWidth: 150 }}
        type="date"
        value={value}
        onChange={onChange}
        InputLabelProps={{
            shrink: true,
        }}
    />
);

export default DatePicker;