import { Arguments } from "yargs";
import * as Tracer from "tracer";
import { FileHandler } from "./file-handler";
import { CLIRelationshipUpload, RelationshipUploadData } from "@schoolbell/common-models/cli-relationship-upload"
import { HTTPClient } from "./http-client";
import { GenericResponse } from "@schoolbell/common-models/generic-response";

export class Main {
  private logLevel: string = process.env.TRACER_LEVEL || "debug";
  private logger: Tracer.Tracer.Logger = Tracer.colorConsole({
    level: this.logLevel,
  });

  private parameters: Arguments;
  private fileHandler: FileHandler;
  private httpClient: HTTPClient;

  constructor(parameters: Arguments) {
    this.parameters = parameters;
    this.httpClient = new HTTPClient(`https://local-api1-dev.schoolbell.chat:9310/upload`);
    // this.httpClient = new HTTPClient(`https://api.schoolbellchat.us/${this.parameters.e}-tsv-filehandler/upload`);
    
  }

  public init() {
    this.logger.info(`File name recieved: ${this.parameters.f}`);
    const fileName: any | string = this.parameters.f;
    const id: any | string = this.parameters.id;
    const delim: any | string = this.parameters.delim;
    this.fileHandler = new FileHandler(id, fileName, delim);
    this.fileHandler.convert().then((relationships:Array<RelationshipUploadData>) => {
      this.logger.debug(`Called convert- `);
      const uploadData: CLIRelationshipUpload = {
        schoolId: id,
        relationshipUploadData: relationships 
      };
      this.logger.debug(`Relationship obtained: ${JSON.stringify(uploadData)}`);
      this.httpClient.post(uploadData).then((result: GenericResponse) => {
        this.logger.info(`${result.httpStatus} Request placed in queue. Will provide an update over email once completed`);
        
      }).catch(error => {
        this.logger.error(error);
      });
    }).catch(error => {
      this.logger.error(error);
    });    
  }
}
