/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as packageJSON from '../package.json';
import { Command } from 'commander';
export const program = new Command();

program.version(packageJSON.version);

//#region frontend
program.option('--frontend', 'Habilita o frontend');
program.option('--frontend-path <path>', 'Caminho dos arquivos de frontend (pasta dist)');
//#endregion

//#region comum
program.option('-c, --config <path>', 'Arquivo JSON de configuração para inicialização');

// Host
program.option('-h, --host <host>', 'Host de execução');
program.option('-p, --port <numero>', 'Porta de execução');
program.option('-k, --secretKey <chave>', 'Chave secreta para validação de tokens');
program.option('--startAllSession', 'Habilita a auto inicialização das sessões');
program.option('--no-startAllSession', 'Desabilita a auto inicialização das sessões');
//#endregion

//#region webhook
program.option('--webhook-url <url>', 'URL para as chamadas de webhook');
program.option('--webhook-autoDownload', 'Habilita o auto download de arquivo');
program.option('--no-webhook-autoDownload', 'Desabilita o auto download de arquivo');
program.option('--webhook-readMessage', 'Habilita a marcação automática de lido');
program.option('--no-webhook-readMessage', 'Desabilita a marcação automática de lido');
program.option('--webhook-allUnreadOnStart', 'Envia no webhook todas as mensagens não lidas na inicialização');
program.option('--no-webhook-listenAcks', 'Desabilita o envio de ACKs no webhook');
program.option('--no-webhook-onPresenceChanged', 'Desabilita o envio do onPresenceChanged no webhook');
program.option('--no-webhook-onParticipantsChanged', 'Desabilita o envio do onParticipantsChanged no webhook');
//#endregion

//#region archive
program.option('--archive-enable', 'Habilita o auto-arquivamento');
program.option('--no-archive-enable', 'Desabilita o auto-arquivamento');
program.option('--archive-waitTime <milisegundos>', 'Tempo de espera de arquivamento entre chats');
program.option('--archive-daysToArchive <dias>', 'Dias de inatividade para arquivar');
//#endregion

//#region log
program.option('--log-level <level>', 'Nível de detalhe de log');
program.option('--log-logger <saidas...>', 'Opções de saída de LOG');
//#endregion

//#region createOptions
program.option('--createOptions-browserArgs <opcoes...>', 'Opções para serem passadas na inicialização do browser');
//#endregion
