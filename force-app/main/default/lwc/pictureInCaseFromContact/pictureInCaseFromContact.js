import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getSession } from 'lightning/platformResourceLoader';

export default class CaseContactImage extends LightningElement {
    @api recordId;
    imageUrl;
    error;

    @wire(getRecord, { recordId: '$recordId', fields: ['Case.Contact.Foto__c'] })
    wiredCase({ error, data }) {
        if (data) {
            const contactField = data.fields.Contact;
            if (contactField && contactField.value && contactField.value.fields.Foto__c) {
                const richText = contactField.value.fields.Foto__c.value;
                if (richText) {
                    const imgTag = richText.match(/<img[^>]+src="([^">]+)"/);
                    if (imgTag && imgTag[1]) {
                        // Decodifica a URL e remove espaços em branco
                        let url = decodeURIComponent(imgTag[1]).trim();
                        
                        // Substitui &amp; por &
                        url = url.replace(/&amp;/g, '&');
                        
                        // Adiciona parâmetros de sessão
                        getSession().then(session => {
                            url += (url.includes('?') ? '&' : '?') + 'oid=' + session.orgId + '&sid=' + session.sessionId;
                            this.imageUrl = url;
                        });
                    } else {
                        this.error = 'Imagem não encontrada no campo Foto__c';
                    }
                } else {
                    this.error = 'Campo Foto__c está vazio';
                }
            } else {
                this.error = 'Contato ou campo Foto__c não encontrado';
            }
        } else if (error) {
            this.error = 'Erro ao carregar o caso: ' + JSON.stringify(error);
        }
    }
}