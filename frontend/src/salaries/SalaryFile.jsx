import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Paid as PaidIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  CalendarMonth as CalendarMonthIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import { useSalaryStore } from '../store/salaryStore';

const translations = {
  so: {
    title: 'Maamulka Mushaharka',
    addSalary: 'Ku Dar Diiwaan Mushahar',
    addAllSalaries: 'Ku Dar Mushahar Macalimiinta Oo Dhan',
    teacher: 'Macalin',
    amount: 'Qadarka',
    month: 'Bisha',
    year: 'Sanadka',
    bonus: 'AbaalMarin',
    deductions: 'Lacag ka Goosasho',
    note: 'Qoraal',
    paid: 'La Bixiyay',
    unpaid: 'Aan La Bixin',
    markAsPaid: 'Calaamadee in La Bixiyay',
    edit: 'Wax Ka Beddel',
    delete: 'Tirtir',
    cancel: 'Jooji',
    save: 'Kaydi',
    totalSalaries: 'Wadarta Mushaharka',
    paidSalaries: 'Mushaharka La Bixiyay',
    unpaidSalaries: 'Mushaharka Aan La Bixin',
    totalAmount: 'Wadarta Qadarka',
    paidAmount: 'Qadar La Bixiyay',
    unpaidAmount: 'Qadar Aan La Bixin',
    salaryRecords: 'Diiwaanka Mushaharka',
    statistics: 'Tirakoob',
    allTeachers: 'Macalimiinta Oo Dhan',
    createSuccess: 'Diiwaanka mushahara si guul leh ayaa loo abuuray',
    updateSuccess: 'Diiwaanka mushahara si guul leh ayaa loo cusboonaysiiyay',
    deleteSuccess: 'Diiwaanka mushahara si guul leh ayaa loo tirtiray',
    markPaidSuccess: 'Mushaharka si guul leh ayaa loo calaamadeeyay in la bixiyay',
    selectTeacher: 'Xulo Macalin',
    selectMonth: 'Xulo Bisha',
    selectYear: 'Xulo Sanadka',
    confirmDelete: 'Ma hubtaa inaad rabto inaad tirtirto diiwaankan mushahara?',
    requiredField: 'Goobtan waa lagama maarmaanka ah',
    loading: 'Soo dejinta...',
    noRecords: 'Lama helin diiwaan mushahar',
    noTeachers: 'Macalimiin lama helin',
    filter: 'Filter',
    clear: 'Nadiif',
    total: 'Wadarta',
    status: 'Xaalad',
    actions: 'Tallaabooyin',
    salaryStatus: 'Xaaladda Mushaharka',
    currentPeriod: 'Mudada Hadda',
    noRecord: 'Diiwaan ma jiro',
  },
};

const months = [
  { value: 1, label: { so: 'Janaayo' }, short: 'Jan' },
  { value: 2, label: { so: 'Febraayo' }, short: 'Feb' },
  { value: 3, label: { so: 'Maarso' }, short: 'Mar' },
  { value: 4, label: { so: 'Abriil' }, short: 'Apr' },
  { value: 5, label: { so: 'Maajo' }, short: 'May' },
  { value: 6, label: { so: 'Juun' }, short: 'Jun' },
  { value: 7, label: { so: 'Luuliyo' }, short: 'Jul' },
  { value: 8, label: { so: 'Agoosto' }, short: 'Aug' },
  { value: 9, label: { so: 'Sebtembar' }, short: 'Sep' },
  { value: 10, label: { so: 'Oktoobar' }, short: 'Oct' },
  { value: 11, label: { so: 'Nofembar' }, short: 'Nov' },
  { value: 12, label: { so: 'Desembar' }, short: 'Dec' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function SalaryFile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const language = 'so';
  const t = translations[language];

  const {
    salaryRecords,
    teachers,
    salaryStatistics,
    loading,
    createSalaryRecord,
    createAllTeachersSalaries,
    getAllTeachers,
    getAllSalaryRecords,
    updateSalaryRecord,
    deleteSalaryRecord,
    getSalaryStatistics,
  } = useSalaryStore();

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: currentYear,
    paid: '', // '', 'true', 'false'
  });

  const [formData, setFormData] = useState({
    teacher: '',
    amount: '',
    month: filters.month,
    year: filters.year,
    bonus: '',
    deductions: '',
    note: '',
    paid: false,
  });

  const [bulkFormData, setBulkFormData] = useState({
    amount: '',
    month: filters.month,
    year: filters.year,
    bonus: '',
    deductions: '',
    note: '',
  });

  // Fetch data when filters change
  useEffect(() => {
    getAllSalaryRecords(filters);
    getSalaryStatistics(filters.month, filters.year);
    getAllTeachers(filters.month, filters.year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.month, filters.year, filters.paid]);

  const handleTabChange = (_e, newValue) => setTabValue(newValue);

  const handleOpenDialog = (record = null) => {
    setCurrentRecord(record);
    if (record) {
      setFormData({
        teacher: record.teacher?._id || '',
        amount: record.amount ?? '',
        month: record.month,
        year: record.year,
        bonus: record.bonus ?? '',
        deductions: record.deductions ?? '',
        note: record.note ?? '',
        paid: !!record.paid,
      });
    } else {
      setFormData({
        teacher: '',
        amount: '',
        month: filters.month,
        year: filters.year,
        bonus: '',
        deductions: '',
        note: '',
        paid: false,
      });
    }
    setOpenDialog(true);
  };

  const handleOpenBulkDialog = () => {
    setBulkFormData({
      amount: '',
      month: filters.month,
      year: filters.year,
      bonus: '',
      deductions: '',
      note: '',
    });
    setOpenBulkDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenBulkDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ month: new Date().getMonth() + 1, year: currentYear, paid: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRecord) {
        await updateSalaryRecord(currentRecord._id, {
          ...formData,
          paid: !!formData.paid,
        });
        toast.success(t.updateSuccess);
      } else {
        await createSalaryRecord({
          ...formData,
          paid: !!formData.paid,
        });
        toast.success(t.createSuccess);
      }
      setOpenDialog(false);
      // Refresh lists
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
      getAllTeachers(filters.month, filters.year);
    } catch (error) {
      console.error('Error saving salary record:', error);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAllTeachersSalaries(bulkFormData);
      toast.success(t.createSuccess);
      setOpenBulkDialog(false);
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
      getAllTeachers(filters.month, filters.year);
    } catch (error) {
      console.error('Error creating bulk salaries:', error);
    }
  };

  const handleMarkAsPaid = async (record) => {
    try {
      await updateSalaryRecord(record._id, { paid: true });
      toast.success(t.markPaidSuccess);
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
    } catch (error) {
      console.error('Error marking salary as paid:', error);
    }
  };

  const handleOpenDeleteDialog = (record) => {
    setCurrentRecord(record);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!currentRecord) return;
    try {
      await deleteSalaryRecord(currentRecord._id);
      toast.success(t.deleteSuccess);
      setOpenDeleteDialog(false);
      getAllSalaryRecords(filters);
      getSalaryStatistics(filters.month, filters.year);
      getAllTeachers(filters.month, filters.year);
    } catch (error) {
      console.error('Error deleting salary record:', error);
    }
  };

  const getMonthName = (monthValue) => {
    const m = months.find((mm) => mm.value === monthValue);
    return m ? m.label[language] : '';
    };

  // Responsive table cells for salary records
  const renderSalaryRecordCells = (record) => {
    const totalStr = (record.totalAmount ?? (Number(record.amount || 0) + Number(record.bonus || 0) - Number(record.deductions || 0))).toLocaleString();

    if (isMobile) {
      return (
        <>
          <TableCell>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                  {record.teacher?.name?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" noWrap>
                    {record.teacher?.name || 'N/A'}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      label={record.paid ? t.paid : t.unpaid}
                      color={record.paid ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      ${totalStr}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </TableCell>
          <TableCell align="right">
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              <Tooltip title={t.edit}>
                <IconButton size="small" onClick={() => handleOpenDialog(record)} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={t.delete}>
                <IconButton size="small" onClick={() => handleOpenDeleteDialog(record)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {!record.paid && (
                <Tooltip title={t.markAsPaid}>
                  <IconButton size="small" onClick={() => handleMarkAsPaid(record)} color="success">
                    <PaidIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </TableCell>
        </>
      );
    }

    return (
      <>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {record.teacher?.name?.charAt(0) || '?'}
            </Avatar>
            <Typography>{record.teacher?.name || 'N/A'}</Typography>
          </Stack>
        </TableCell>
        <TableCell>${Number(record.amount || 0).toLocaleString()}</TableCell>
        <TableCell>${Number(record.bonus || 0).toLocaleString()}</TableCell>
        <TableCell>${Number(record.deductions || 0).toLocaleString()}</TableCell>
        <TableCell>
          <Typography fontWeight="bold">${totalStr}</Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={record.paid ? t.paid : t.unpaid}
            color={record.paid ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title={t.edit}>
              <IconButton size="small" onClick={() => handleOpenDialog(record)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={t.delete}>
              <IconButton size="small" onClick={() => handleOpenDeleteDialog(record)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {!record.paid && (
              <Tooltip title={t.markAsPaid}>
                <IconButton size="small" onClick={() => handleMarkAsPaid(record)} color="success">
                  <PaidIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </>
    );
  };

  return (
    <Box sx={{ p: isSmallMobile ? 1 : 3, backgroundColor: '#f8fafc', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Header Section */}
      <Box sx={{ mb: isSmallMobile ? 2 : 4 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
          {t.title}
        </Typography>

        {/* Period Selector Card */}
        <Card elevation={0} sx={{ backgroundColor: 'primary.light', p: isSmallMobile ? 2 : 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <CalendarMonthIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t.currentPeriod}
              </Typography>
              <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
                {getMonthName(filters.month)} {filters.year}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t.month}</InputLabel>
                <Select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} label={t.month} sx={{ backgroundColor: 'white' }}>
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {isMobile ? month.short : month.label[language]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t.year}</InputLabel>
                <Select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} label={t.year} sx={{ backgroundColor: 'white' }}>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button variant="contained" startIcon={!isSmallMobile && <AddIcon />} onClick={() => handleOpenDialog()} fullWidth sx={{ height: '40px' }}>
                {isSmallMobile ? <AddIcon /> : t.addSalary}
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={isSmallMobile ? 1 : 3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
            <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: isSmallMobile ? 40 : 48, height: isSmallMobile ? 40 : 48 }}>
                  <PeopleIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" fontSize={isSmallMobile ? '0.7rem' : '0.875rem'}>
                    {t.totalSalaries}
                  </Typography>
                  <Typography variant={isSmallMobile ? 'h6' : 'h4'} sx={{ fontWeight: 'bold' }}>
                    {salaryStatistics?.totalSalaries || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
            <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: isSmallMobile ? 40 : 48, height: isSmallMobile ? 40 : 48 }}>
                  <PaidIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" fontSize={isSmallMobile ? '0.7rem' : '0.875rem'}>
                    {t.paidSalaries}
                  </Typography>
                  <Typography variant={isSmallMobile ? 'h6' : 'h4'} sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {salaryStatistics?.paidSalaries || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
            <CardContent sx={{ p: isSmallMobile ? 2 : 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: isSmallMobile ? 40 : 48, height: isSmallMobile ? 40 : 48 }}>
                  <AttachMoneyIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" fontSize={isSmallMobile ? '0.7rem' : '0.875rem'}>
                    {t.unpaidSalaries}
                  </Typography>
                  <Typography variant={isSmallMobile ? 'h6' : 'h4'} sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {salaryStatistics?.unpaidSalaries || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{ '& .MuiTabs-indicator': { height: 4, backgroundColor: 'primary.main' } }}
          >
            <Tab icon={isSmallMobile ? <PeopleIcon /> : undefined} iconPosition="start" label={isSmallMobile ? undefined : t.salaryRecords} sx={{ fontWeight: 'bold', minWidth: isSmallMobile ? 72 : 'auto' }} />
            <Tab icon={isSmallMobile ? <BarChartIcon /> : undefined} iconPosition="start" label={isSmallMobile ? undefined : t.statistics} sx={{ fontWeight: 'bold', minWidth: isSmallMobile ? 72 : 'auto' }} />
            <Tab icon={isSmallMobile ? <CalendarMonthIcon /> : undefined} iconPosition="start" label={isSmallMobile ? undefined : t.allTeachers} sx={{ fontWeight: 'bold', minWidth: isSmallMobile ? 72 : 'auto' }} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: isSmallMobile ? 1 : 3 }}>
          {/* Salary Records Tab */}
          {tabValue === 0 && (
            <>
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: 3, gap: isMobile ? 2 : 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {t.salaryRecords} - {getMonthName(filters.month)} {filters.year}
                </Typography>

                <Stack direction={isMobile ? 'column' : 'row'} spacing={2} width={isMobile ? '100%' : 'auto'}>
                  <Button variant="outlined" startIcon={!isSmallMobile && <FilterIcon />} onClick={handleOpenBulkDialog} fullWidth={isMobile} size={isSmallMobile ? 'small' : 'medium'}>
                    {isSmallMobile ? <FilterIcon /> : t.addAllSalaries}
                  </Button>

                  <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 140 }}>
                    <InputLabel>{t.status}</InputLabel>
                    <Select value={filters.paid} onChange={(e) => setFilters({ ...filters, paid: e.target.value })} label={t.status}>
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">{t.paid}</MenuItem>
                      <MenuItem value="false">{t.unpaid}</MenuItem>
                    </Select>
                  </FormControl>

                  <Button variant="text" onClick={clearFilters}>{t.clear}</Button>
                </Stack>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
                  <TableHead sx={{ bgcolor: 'grey.100' }}>
                    <TableRow>
                      {isMobile ? (
                        <>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.teacher}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.teacher}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.amount}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.bonus}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.deductions}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.total}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.status}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 2 : 7} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : salaryRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 2 : 7} align="center">
                          {t.noRecords}
                        </TableCell>
                      </TableRow>
                    ) : (
                      salaryRecords.map((record) => (
                        <TableRow key={record._id} hover>
                          {renderSalaryRecordCells(record)}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Statistics Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t.statistics} - {getMonthName(filters.month)} {filters.year}
              </Typography>
              <Grid container spacing={isSmallMobile ? 1 : 3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ p: isSmallMobile ? 1.5 : 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontSize={isSmallMobile ? '0.9rem' : '1rem'}>
                      Mushaharka Guud
                    </Typography>
                    <Typography variant={isSmallMobile ? 'h6' : 'h4'} sx={{ fontWeight: 'bold' }}>
                      ${Number(salaryStatistics?.totalAmount || 0).toLocaleString()}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ p: isSmallMobile ? 1.5 : 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontSize={isSmallMobile ? '0.9rem' : '1rem'}>
                      Qiyaastii Bixinta
                    </Typography>
                    <Typography variant={isSmallMobile ? 'h6' : 'h4'} sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${Number(salaryStatistics?.paidAmount || 0).toLocaleString()}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ p: isSmallMobile ? 1.5 : 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontSize={isSmallMobile ? '0.9rem' : '1rem'}>
                      Qiyaastii aan la bixin
                    </Typography>
                    <Typography variant={isSmallMobile ? 'h6' : 'h4'} sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      ${Number(salaryStatistics?.unpaidAmount || 0).toLocaleString()}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* All Teachers Tab */}
          {tabValue === 2 && (
            <TableContainer component={Paper} elevation={0} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t.teacher}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                      </>
                    )}
                    <TableCell sx={{ fontWeight: 'bold' }}>{t.salaryStatus}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 3 : 5} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 3 : 5} align="center">
                        {t.noTeachers}
                      </TableCell>
                    </TableRow>
                  ) : (
                    teachers.map((teacher) => (
                      <TableRow key={teacher._id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {teacher.name?.charAt(0) || '?'}
                            </Avatar>
                            <Box>
                              <Typography>{teacher.name}</Typography>
                              {isMobile && (
                                <Typography variant="caption" color="text.secondary">
                                  {teacher.email}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>{teacher.subject}</TableCell>
                          </>
                        )}
                        <TableCell>
                          {teacher.salaryRecord ? (
                            <Chip label={teacher.salaryRecord.paid ? t.paid : t.unpaid} color={teacher.salaryRecord.paid ? 'success' : 'error'} size="small" variant="outlined" />
                          ) : (
                            <Chip label={t.noRecord} color="warning" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              if (teacher.salaryRecord) {
                                handleOpenDialog(teacher.salaryRecord);
                              } else {
                                setFormData({
                                  teacher: teacher._id,
                                  amount: '',
                                  month: filters.month,
                                  year: filters.year,
                                  bonus: '',
                                  deductions: '',
                                  note: '',
                                  paid: false,
                                });
                                setOpenDialog(true);
                              }
                            }}
                          >
                            {teacher.salaryRecord ? t.edit : t.addSalary}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Card>

      {/* Add/Edit Salary Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" fullScreen={isSmallMobile}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
          {currentRecord ? t.edit : t.addSalary}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t.teacher}</InputLabel>
                  <Select name="teacher" value={formData.teacher} onChange={handleInputChange} label={t.teacher} required disabled={!!currentRecord}>
                    <MenuItem value="">{t.selectTeacher}</MenuItem>
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="amount" label={t.amount} type="number" value={formData.amount} onChange={handleInputChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t.month}</InputLabel>
                  <Select name="month" value={formData.month} onChange={handleInputChange} label={t.month} required>
                    {months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label[language]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t.year}</InputLabel>
                  <Select name="year" value={formData.year} onChange={handleInputChange} label={t.year} required>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="bonus" label={t.bonus} type="number" value={formData.bonus} onChange={handleInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="deductions" label={t.deductions} type="number" value={formData.deductions} onChange={handleInputChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField name="note" label={t.note} value={formData.note} onChange={handleInputChange} fullWidth multiline rows={3} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t.status}</InputLabel>
                  <Select
                    name="paid"
                    value={String(formData.paid)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paid: e.target.value === 'true' }))}
                    label={t.status}
                  >
                    <MenuItem value={'false'}>{t.unpaid}</MenuItem>
                    <MenuItem value={'true'}>{t.paid}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={handleCloseDialog} color="secondary">
                {t.cancel}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {t.save}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} fullWidth maxWidth="sm" fullScreen={isSmallMobile}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
          {t.addAllSalaries}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <form onSubmit={handleBulkSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField name="amount" label={t.amount} type="number" value={bulkFormData.amount} onChange={handleBulkInputChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="bonus" label={t.bonus} type="number" value={bulkFormData.bonus} onChange={handleBulkInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="deductions" label={t.deductions} type="number" value={bulkFormData.deductions} onChange={handleBulkInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t.month}</InputLabel>
                  <Select name="month" value={bulkFormData.month} onChange={handleBulkInputChange} label={t.month} required>
                    {months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label[language]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t.year}</InputLabel>
                  <Select name="year" value={bulkFormData.year} onChange={handleBulkInputChange} label={t.year} required>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField name="note" label={t.note} value={bulkFormData.note} onChange={handleBulkInputChange} fullWidth multiline rows={3} />
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={() => setOpenBulkDialog(false)} color="secondary">
                {t.cancel}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {t.save}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t.confirmDelete}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>{t.cancel}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
