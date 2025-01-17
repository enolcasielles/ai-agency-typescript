import { Agency } from "../../agency/Agency";
import { Agent } from "../../agents/Agent";
import { RunProps, Tool } from "../Tool";

interface Props {
  senderAgent: Agent;
  agency: Agency;
}

export class TalkToAgent extends Tool {
  senderAgent: Agent;
  agency: Agency;
  constructor({ senderAgent, agency }: Props) {
    super({
      name: "TalkToAgent",
      description:
        "Utiliza esta herramienta para facilitar la comunicación directa y sincrónica entre agentes especializados dentro de la agencia. Cuando envíes un mensaje usando esta herramienta, recibirás una respuesta exclusivamente del agente destinatario designado. Para continuar el diálogo, invoca esta herramienta nuevamente con el agente destinatario deseado y tu mensaje de seguimiento. Recuerda, la comunicación aquí es sincrónica; el agente destinatario no realizará ninguna tarea después de la respuesta. Eres responsable de transmitir las respuestas del agente destinatario de vuelta al usuario, ya que el usuario no tiene acceso directo a estas respuestas. Sigue interactuando con la herramienta para una interacción continua hasta que la tarea esté completamente resuelta.",
      parameters: {
        type: "object",
        properties: {
          recipient: {
            type: "string",
            description:
              "Por favor, especifica el nombre del agente destinatario",
          },
          message: {
            type: "string",
            description:
              "Por favor, especifica la tarea que el agente destinatario debe completar. Concéntrate en aclarar en qué consiste la tarea, en lugar de proporcionar instrucciones exactas.",
          },
        },
        required: ["message"],
      },
    });
    this.senderAgent = senderAgent;
    this.agency = agency;
  }

  async run(parameters: RunProps): Promise<string> {
    const senderName = this.senderAgent.name;
    const recipientName = parameters.recipient;
    const message = parameters.message;
    const thread = this.agency.getThread(senderName, recipientName);
    if (!thread) return "ERROR: No puedes comunicarte con ese agente.";
    return await thread.send(message);
  }
}
