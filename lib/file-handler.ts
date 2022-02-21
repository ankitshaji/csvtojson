import * as Tracer from "tracer";
import * as fs from "fs";
import * as csvtojson from "csvtojson";
import { Converter } from "csvtojson/v2/Converter";
import { RelationshipUploadData } from "@schoolbell/common-models/cli-relationship-upload";

export class FileHandler {
  private logLevel: string = process.env.TRACER_LEVEL || "debug";
  private logger: Tracer.Tracer.Logger = Tracer.colorConsole({
    level: this.logLevel,
  });
  private fileName: string;
  private id: string;
  private delim: string;

  constructor(id: string, fileName: string, delim: string) {
    this.fileName = fileName;
    this.id = id;
    this.delim = delim;
  }

  public open(): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      fs.readFile(this.fileName, (err, data) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info("Running convert - ");
          resolve(data);
        }
      });
    });
  }
 
  public convert(): Promise<Array<RelationshipUploadData>> {
    return new Promise<Array<RelationshipUploadData>>((resolve, reject) => {
      const relationships: Array<RelationshipUploadData> =
        new Array<RelationshipUploadData>();
      const converter: Converter = csvtojson
        .default({
          delimiter: this.delim,
          trim: true,
          nullObject: false,
          headers: [
            `STUDENT_ID`,
            `STUDENT_FIRST_NAME`,
            `STUDENT_LAST_NAME`,
            `TEACHER_EMAIL_ADDRESS`,
            `PARENT_EMAIL_ADDRESS`,
            `GROUP`,
            `ACTION`,
          ],
          checkColumn: true,
        })
        .fromFile(this.fileName);
      converter.on(`data`, (data: Buffer) => {
        this.logger.debug(data.toString(`utf-8`));
        const dataReceived = JSON.parse(data.toString(`utf-8`));
        const relationship: RelationshipUploadData = {
          action: dataReceived.ACTION,
          group: dataReceived.GROUP,
          parentEmailAddress: dataReceived.PARENT_EMAIL_ADDRESS.toLowerCase(),
          studentFirstName: dataReceived.STUDENT_FIRST_NAME,
          studentId: dataReceived.STUDENT_ID,
          studentLastName: dataReceived.STUDENT_LAST_NAME,
          teacherEmailAddress: dataReceived.TEACHER_EMAIL_ADDRESS.toLowerCase(),
        };
        relationships.push(relationship);
      });
      converter.on(`error`, (error: Error) => {
        this.logger.warn(error.message);
        this.logger.warn('USAGE: sync-relationship --id <SCHOOL_ID> -f <RELATIONSHIP_FILE.EXTN> [--delim="<|>"]')
        reject(error);
      });
      converter.on(`end`, () => {
        this.logger.debug("Finished parsing data");
        resolve(relationships);
      });
    });
  }
}
