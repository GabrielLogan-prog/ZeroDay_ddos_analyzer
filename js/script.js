// script.js
let blockedRequests = 0; // Nova variável para contar requisições bloqueadas
let totalTraffic = 0; // Nova variável para armazenar o total de tráfego

document.addEventListener("DOMContentLoaded", () => {
    const ctxAttack = document.getElementById("attackChart").getContext("2d");
    const ctxTraffic = document.getElementById("trafficChart").getContext("2d");
  
    // Gráfico de Frequência de Ataques
    
    new Chart(ctxAttack, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Attacks",
            data: [4000, 3000, 2000, 2500, 2300, 3200],
            backgroundColor: "rgba(108, 99, 255, 0.8)",
          },
        ],
      },
      options: {
        responsive: true,
      },
    });
  
    // Gráfico de Visão Geral do Tráfego

    new Chart(ctxTraffic, {
      type: "line",
      data: {
        labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
        datasets: [
          {
            label: "Traffic",
            data: [2500, 2000, 10000, 8000, 6000, 5000],
            borderColor: "rgba(108, 99, 255, 0.8)",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
      },
    });

    // Adiciona os event listeners para o filtro de IP
    const ipFilter = document.getElementById('ipFilter');
    const filterButton = document.getElementById('filterButton');

    ipFilter.addEventListener('input', () => {
      const filterValue = ipFilter.value;
      if (isValidIPFormat(filterValue)) {
        populateLogsTable(globalLogs, filterValue);
      } else if (filterValue !== '' && !filterValue.endsWith('.')) {
        alert('Formato de IP inválido. Use o formato 000.000.000.00');
      } else {
        populateLogsTable(globalLogs);
      }
    });

    filterButton.addEventListener('click', () => {
      if (globalLogs.length === 0) {
        alert('A tabela está vazia. Por favor, faça um refresh para carregar os dados.');
        return;
      }
      const filterValue = ipFilter.value;
      if (isValidIPFormat(filterValue)) {
        populateLogsTable(globalLogs, filterValue);
      } else {
        alert('Formato de IP inválido. Use o formato 000.000.000.00');
      }
    });

    // Adiciona o evento de clique para buscar logs
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchDDoSLogs);
    }

    // Inicializa a tabela vazia
    populateLogsTable([]);
});

// Função para formatar a data
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Função para validar o formato do IP
function isValidIPFormat(ip) {
  // Permite dígitos e pontos, mas não termina com ponto
  const ipPattern = /^(\d{1,3}\.){0,3}\d{1,3}(\.)?$/;
  return ipPattern.test(ip);
}

// Função para filtrar os logs
function filterLogs(logs, filterValue) {
  return logs.filter(log => log['IPV4'].startsWith(filterValue));
}

// Variável global para armazenar os logs
let globalLogs = [];

// Função para buscar dados de ataque DDoS da API
async function fetchDDoSLogs() {
  try {
      // Desativa o botão durante a requisição para evitar múltiplos cliques
      const refreshButton = document.querySelector('.refresh-button');
      if (refreshButton) {
          refreshButton.disabled = true;
          refreshButton.textContent = 'Carregando...';
      }

      // Realiza a requisição à API usando fetch
      const response = await fetch('http://localhost:4444/logs');
      
      // Verifica se a resposta foi bem-sucedida , se 
      if (!response.ok) {
          throw new Error('Erro ao buscar logs de DDoS');
      }
      
      // Converte a resposta para JSON e armazena globalmente
      globalLogs = await response.json();
      
      // Popula a tabela com os logs
      populateLogsTable(globalLogs);

  } catch (error) {
      console.error('Erro na busca de logs:', error);
      alert('Não foi possível carregar os logs de DDoS \n Você deve iniciar o servidor com a API.');
  } finally {
      // Reativa o botão após a requisição
      const refreshButton = document.querySelector('.refresh-button');
      if (refreshButton) {
          refreshButton.disabled = false;
          refreshButton.textContent = 'Refresh';
      }
  }
}

// Função para popular a tabela de logs
function populateLogsTable(logs, filter = '') {
  // Seleciona o elemento da tabela
  const tableSection = document.querySelector('.table-section');
  
  // Se não houver logs e não houver filtro, mostra mensagem inicial
  if (logs.length === 0 && !filter) {
    tableSection.innerHTML = '<p style="color: red;">A tabela está vazia, clique no botão refresh</p>';
    return;
  }

  const filteredLogs = filter ? filterLogs(logs, filter) : logs;
  
  // Se houver filtro e não encontrar resultados
  if (filteredLogs.length === 0 && filter) {
    tableSection.innerHTML = '<p style="color: red;">Nenhum resultado encontrado para o filtro aplicado.</p>';
    return;
  }

  // Cria uma nova tabela
  const table = document.createElement('table');
  table.innerHTML = `
      <thead>
          <tr>
              <th>IPV4</th>
              <th>Data/Hora</th>
              <th>Method</th>
              <th>URL</th>
              <th>User Agent</th>
              <th>Country</th>
              <th>WAF</th>
              <th>Traffic</th>
              <th>SIZE</th>
          </tr>
      </thead>
      <tbody id="logs-body"></tbody>
  `;
  
  // Seleciona o corpo da tabela
  const tableBody = table.querySelector('#logs-body');

  blockedRequests = 0; // Resetar o contador antes de popular a tabela
  
  // Popula as linhas da tabela com limitação
  const maxLogs = 10000; // Limita a exibição para melhor performance
  filteredLogs.slice(0, maxLogs).forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td title="${log['IPV4']}">${log['IPV4']}</td>
          <td title="${formatDate(log['Date/Time'])}">${formatDate(log['Date/Time'])}</td>
          <td title="${log['Method']}">${log['Method']}</td>
          <td title="${log['URL']}">${log['URL']}</td>
          <td title="${log['User Agent']}">${log['User Agent']}</td>
          <td title="${log['country']}">${log['country']}</td>
          <td title="${log['WAF']}">${log['WAF']}</td>
          <td title="${log['Traffic']}">${log['Traffic']}</td>
          <td title="${log['SIZE']}">${log['SIZE']}</td>
      `;
      tableBody.appendChild(row);
        // Contar requisições bloqueadas
    if (log['WAF'] === 'BLOCK') {
      blockedRequests++;
    }

// SOMAR O TOTAL DE TRÁFEGO


// Somar o tamanho do tráfego
 totalTraffic += parseInt(log['SIZE']) || 0;
  
  });


    
  
// ... (previous code remains unchanged)

// Adiciona o total de tráfego
const totalTrafficElement = document.querySelector('.total-traffic');
totalTrafficElement.textContent = formatBytes(totalTraffic);

// Função para formatar bytes em uma unidade legível
function formatBytes(bytes, decimals = 2) {
if (bytes === 0) return '0 Bytes';

const k = 1024;
const dm = decimals < 0 ? 0 : decimals;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const i = Math.floor(Math.log(bytes) / Math.log(k));

return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}



  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  //adiciona o total de linhas ao elemento Total atatcks
  const totalAttacksElement = document.querySelector('.total-attacks');

  totalAttacksElement.textContent = formatNumber(filteredLogs.length); // Formata o valor como moeda brasileira com ponto e virgula ;

  //mostra o total de requisicoes bloqueadas
  const totalBlockedRequestsElement = document.querySelector('.blocked-requests');

  totalBlockedRequestsElement.textContent = formatNumber(blockedRequests ); // Formata o valor como moeda brasileira com ponto e virgulablockedRequests;

  console.log(blockedRequests);

  // Substitui o conteúdo da seção da tabela
  tableSection.innerHTML = '';
  tableSection.appendChild(table);

  // Adiciona contagem de logs
  const logCount = document.createElement('div');
  logCount.textContent = `Total de logs: ${filteredLogs.length} (Exibindo ${Math.min(filteredLogs.length, maxLogs)})`;
  
  logCount.style.marginTop = '10px';
  logCount.style.fontSize = '0.9em';
  tableSection.appendChild(logCount);
}
//precisamos somar todos os ZISES para calcular o total de bytes
function calculateTotalBytes(logs) {
  return logs.reduce((total, log) => total + log['SIZE'], 0);

}

const totalSize= globalLogs.filter(log => log['WAF'] === 'BLOCK');
console.log(totalSize);