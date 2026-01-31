const API_BASE_URL = 'http://localhost:8080/api';

async function createOccurrence(occurrenceData) {
    try {
        const response = await fetch(`${API_BASE_URL}/occurrences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(occurrenceData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar ocorrência');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function listOccurrences(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.start) params.append('start', filters.start);
        if (filters.end) params.append('end', filters.end);

        const url = `${API_BASE_URL}/occurrences${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erro ao listar ocorrências');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function getOccurrenceById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/occurrences/${id}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Ocorrência não encontrada');
            }
            throw new Error('Erro ao buscar ocorrência');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function getSummaryStats(start, end) {
    try {
        const params = new URLSearchParams({
            start: start,
            end: end
        });

        const response = await fetch(`${API_BASE_URL}/stats/summary?${params}`);

        if (!response.ok) {
            throw new Error('Erro ao buscar estatísticas');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

async function generatePdfReport(start, end, type = null) {
    try {
        const params = new URLSearchParams({
            start: start,
            end: end
        });
        
        if (type) params.append('type', type);

        const response = await fetch(`${API_BASE_URL}/reports/pdf?${params}`);

        if (!response.ok) {
            throw new Error('Erro ao gerar PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-iba-${start}-${end}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}