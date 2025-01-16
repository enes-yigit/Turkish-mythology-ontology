import React, { useState } from 'react';
import { 
  Paper, 
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import BookIcon from '@mui/icons-material/Book';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import axios from 'axios';

// Özel tema oluşturma
const theme = createTheme({
  palette: {
    primary: {
      main: '#1F4B6B',
      light: '#2A6A98',
      dark: '#153447',
    },
    secondary: {
      main: '#C3922E',
      light: '#DBA844',
      dark: '#A67B24',
    },
    error: {
      main: '#AF2D2D',
    },
    background: {
      default: '#F5F7F9',
      paper: '#FFFFFF',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h1: {
      fontFamily: "'Playfair Display', serif",
      color: '#1F4B6B',
    },
    h2: {
      fontFamily: "'Playfair Display', serif",
      color: '#1F4B6B',
    },
    h3: {
      fontFamily: "'Playfair Display', serif",
      color: '#1F4B6B',
    },
    h4: {
      fontFamily: "'Playfair Display', serif",
      color: '#1F4B6B',
    },
    h5: {
      fontFamily: "'Playfair Display', serif",
      color: '#1F4B6B',
    },
    h6: {
      fontFamily: "'Playfair Display', serif",
      color: '#1F4B6B',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 0 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1F4B6B 0%, #2A6A98 100%)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(31, 75, 107, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(31, 75, 107, 0.12)',
            },
          },
        },
      },
    },
  },
});

function ResultDisplay({ data, question }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Sonuç bulunamadı.</Typography>
      </Box>
    );
  }

  // Tablo başlıklarını otomatik oluştur
  const headers = Object.keys(data[0]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {question}
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              {headers.map((header) => (
                <TableCell 
                  key={header}
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}
                >
                  {formatHeader(header)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
              >
                {headers.map((header) => (
                  <TableCell key={`${index}-${header}`}>
                    {formatValue(row[header])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Başlıkları formatla
function formatHeader(header) {
  return header
    .replace(/([A-Z])/g, ' $1') // camelCase'i ayır
    .replace(/_/g, ' ') // alt çizgileri boşluğa çevir
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Değerleri formatla
function formatValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'Evet' : 'Hayır';
  }
  if (typeof value === 'number') {
    return value.toLocaleString('tr-TR');
  }
  return value;
}

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const competencyQuestions = [
    {
      id: 1,
      question: "Hangi tanrılar birden fazla kutsal alanı yönetmektedir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?tanriAdi (COUNT(?alan) as ?alanSayisi)
        WHERE {
          ?tanri rdf:type :Tanrılar ;
                 :yonetir ?alan .
          OPTIONAL { ?tanri :ad ?tanriAdi }
        }
        GROUP BY ?tanri ?tanriAdi
        HAVING (COUNT(?alan) > 1)
      `
    },
    {
      id: 2,
      question: "En yüksek hasar gücüne sahip silahlar hangileridir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?silahAdi ?hasarGucu
        WHERE {
          ?silah rdf:type :Silahlar ;
                 :nesne_adı ?silahAdi ;
                 :hasar_gücü ?hasarGucu .
        }
        ORDER BY DESC(?hasarGucu)
        LIMIT 5
      `
    },
    {
      id: 3,
      question: "Hangi kahramanlar hangi silahları kullanmaktadır?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?kahramanAdi ?silahAdi
        WHERE {
          ?kahraman rdf:type :Kahramanlar ;
                    :kullanır ?silah ;
                    :ad ?kahramanAdi .
          ?silah :nesne_adı ?silahAdi .
        }
      `
    },
    {
      id: 4,
      question: "Kutsal alanlarda hangi nesneler bulunmaktadır?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?alanAdi ?nesneAdi
        WHERE {
          ?alan rdf:type :KutsalAlanlar ;
                 :mekan_adı ?alanAdi ;
                 :barındırır ?nesne .
          ?nesne :nesne_adı ?nesneAdi .
        }
      `
    },
    {
      id: 5,
      question: "Hangi tanrılar hangi kahramanlara güç vermektedir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?tanriAdi ?kahramanAdi
        WHERE {
          ?tanri rdf:type :Tanrılar ;
                 :gucVerir ?kahraman .
          OPTIONAL { 
            ?tanri :ad ?tanriAdi .
            ?kahraman :ad ?kahramanAdi 
          }
        }
      `
    },
    {
      id: 6,
      question: "En yüksek nüfus kapasitesine sahip yaşam alanları hangileridir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?mekanAdi ?nufusKapasitesi
        WHERE {
          ?alan rdf:type :YaşamAlanları ;
                 :mekan_adı ?mekanAdi ;
                 :nüfus_kapasitesi ?nufusKapasitesi .
        }
        ORDER BY DESC(?nufusKapasitesi)
      `
    },
    {
      id: 7,
      question: "Aktif durumda olan savaş sistemleri hangileridir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?mekanikAdi ?etkiAlani
        WHERE {
          ?sistem rdf:type :SavaşSistemi ;
                  :mekanik_adı ?mekanikAdi ;
                  :etki_alanı ?etkiAlani ;
                  :aktif_durum "true"^^xsd:boolean .
        }
      `
    },
    {
      id: 8,
      question: "En yüksek kutsiyet seviyesine sahip kutsal öğeler hangileridir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?nesneAdi ?kutsiyetSeviyesi ?kokenHikayesi
        WHERE {
          ?nesne rdf:type :KutsalÖğe ;
                 :nesne_adı ?nesneAdi ;
                 :kutsiyet_seviyesi ?kutsiyetSeviyesi ;
                 :köken_hikayesi ?kokenHikayesi .
        }
        ORDER BY DESC(?kutsiyetSeviyesi)
      `
    },
    {
      id: 9,
      question: "Hangi boylar hangi güç seviyesine sahiptir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?boyAdi ?gucSeviyesi ?nufus
        WHERE {
          ?boy rdf:type :BoylarSistemi ;
               :boy_adı ?boyAdi ;
               :güç_seviyesi ?gucSeviyesi ;
               :nüfus ?nufus .
        }
        ORDER BY DESC(?gucSeviyesi)
      `
    },
    {
      id: 10,
      question: "Hangi ritüel nesneleri hangi şartlarda kullanılmaktadır?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?nesneAdi ?rituelTuru ?kullanimSarti
        WHERE {
          ?nesne rdf:type :RitüelNesneleri ;
                 :nesne_adı ?nesneAdi ;
                 :ritüel_türü ?rituelTuru ;
                 :kullanım_şartı ?kullanimSarti .
        }
      `
    },
    {
      id: 11,
      question: "En yüksek önem derecesine sahip kültürel sistemler hangileridir?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?sistemAdi ?onemDerecesi ?etkiAlani
        WHERE {
          ?sistem rdf:type :KültürelSistem ;
                  :sistem_adı ?sistemAdi ;
                  :önem_derecesi ?onemDerecesi ;
                  :kulturel_etki_alanı ?etkiAlani .
        }
        ORDER BY DESC(?onemDerecesi)
      `
    },
    {
      id: 12,
      question: "Hangi yaşam alanları hangi kaynakları sağlamaktadır?",
      query: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX : <http://www.semanticweb.org/recep/ontologies/2024/10/TurkMitologyAndPcGames#>
        
        SELECT ?mekanAdi ?kaynak ?kaynaklarZenginligi
        WHERE {
          ?alan rdf:type :YaşamAlanları ;
                 :mekan_adı ?mekanAdi ;
                 :kaynak_zenginliği ?kaynaklarZenginligi ;
                 :sağlar ?kaynak .
          ?kaynak :kaynak_türü ?kaynakTuru .
        }
        ORDER BY DESC(?kaynaklarZenginligi)
      `
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:8080/api/ontology/query',
        question.query,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
      setResults(response.data);
      setError(null);
      if (mobileOpen) setMobileOpen(false);
    } catch (err) {
      console.error('Error details:', err);
      setError('Sorgu çalıştırılırken bir hata oluştu: ' + err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 320 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BookIcon color="primary" />
        <Typography variant="h6" noWrap>
          Sorgu Listesi
        </Typography>
      </Box>
      <Divider />
      <List sx={{ p: 2 }}>
        {competencyQuestions.map((q) => (
          <ListItem 
            key={q.id}
            button 
            onClick={() => handleQuestionClick(q)}
            selected={selectedQuestion?.id === q.id}
            sx={{
              mb: 1,
              borderRadius: 2,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                backgroundColor: 'rgba(31, 75, 107, 0.08)',
                borderLeft: '4px solid #1F4B6B',
                '&:hover': {
                  backgroundColor: 'rgba(31, 75, 107, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(31, 75, 107, 0.04)',
              },
            }}
          >
            <ListItemText 
              primary={q.question}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: selectedQuestion?.id === q.id ? 500 : 400,
                color: selectedQuestion?.id === q.id ? '#1F4B6B' : 'inherit',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'secondary.main',
                borderRadius: '50%',
                width: 40,
                height: 40,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <AutoFixHighIcon sx={{ 
                  color: '#fff',
                  fontSize: 24
                }} />
              </Box>
              <Typography 
                variant="h6" 
                noWrap 
                component="div"
                sx={{
                  color: '#fff',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              >
                Türk Mitolojisi Ontolojisi
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: 320 }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Mobil performansı için
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { width: 320, boxSizing: 'border-box' },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { width: 320, boxSizing: 'border-box' },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 320px)` },
            mt: 8,
          }}
        >
          <Toolbar />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : results ? (
            <ResultDisplay 
              data={results} 
              question={selectedQuestion?.question}
            />
          ) : null}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
