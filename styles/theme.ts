import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#603F99', 
    },
    secondary: {
      main: '#A3A3A3', 
    },
  },
  typography: {
    fontFamily: 'Mont, sans-serif',
  },/*
  typography: {
    t1: { fontSize: '24px', fontWeight: 700, color: '#000000' },
    t2: { fontSize: '18px', fontWeight: 500, color: '#333333' },
    t3: { fontSize: '14px', fontWeight: 400, color: '#666666' },
  },*/
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "14px",
          padding: "15px 15px",
          boxShadow: 'none',
          borderRadius: "0",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0",
        },
      },
    }, 
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'collapse',
          width: '100%',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: "0",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#E3E3E3',
          color: '#858585',
          padding: '12px 16px',
        },
        body: {
          color: '#333',
          padding: '12px 16px',
          borderBottom: "none",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#F4F4F4',
          },
        },
      },
    },
    MuiPopper: {
      styleOverrides: {
        root: {
          "& .MuiPaper-root": {
            border: "2px solid #603F99",
            borderRadius: "4px", 
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: "2px solid #603F99",
          borderRadius: "4px",
        },
      },
    },
  },
});

export default theme;