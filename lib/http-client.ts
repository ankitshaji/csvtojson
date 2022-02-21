import { CLIRelationshipUpload } from "@schoolbell/common-models/cli-relationship-upload"
import { GenericResponse } from "@schoolbell/common-models/generic-response"
import axios, { AxiosResponse } from "axios";
import * as Tracer from "tracer";
import { HttpRespponse } from "@schoolbell/common-models/http-response"
import { HttpStatusCodes } from "@schoolbell/common-models/http-response-codes";

export class HTTPClient{
    private URL: string;
    private logLevel: string = process.env.TRACER_LEVEL || "debug";
  private logger: Tracer.Tracer.Logger = Tracer.colorConsole({
    level: this.logLevel,
  });
  
    constructor(url: string){
        this.URL = url;
        this.logger.debug(`URL:${this.URL}`);
        
    }

    public post(data: CLIRelationshipUpload): Promise<GenericResponse> {
        return new Promise<GenericResponse>((resolve,reject) => {
            this.logger.debug('POST Method Entry')
            axios.post(this.URL, data).then((response: AxiosResponse<GenericResponse>)=>{
                if( response.data.httpStatus === HttpStatusCodes.OK ) {
                    this.logger.debug(JSON.stringify(response.data));
                } else {
                    this.logger.warn(`Error in transmission: ${response.data.httpStatus}`);
                    reject(response.data.message);
                }
                resolve(response.data);
            }).catch(error=>{
                this.logger.error(error);
                reject(error);  
            });
        })
    }
}