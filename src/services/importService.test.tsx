import importService, { IImportService } from "./importService";
import MockFactory from "../common/mockFactory";
import { IV1Project } from "../models/v1Models";
import ImportService from "./importService";

describe("Import Service", () => {
    let importService: IImportService = null;

    beforeEach(() => {
        importService = new ImportService();
    });

    it("ConvertV1 takes a V1 Project and produces a valid V2 project JSON string", async () => {
        const arrayOfBlob = new Array<Blob>();
        const file = new File(arrayOfBlob, "TestV1Project.jpg", { type: "application/json" });
        file.path = "/Users/user/path/to/TestV1Project.jpg";
        const project = MockFactory.createTestV1Project();
        const content = JSON.stringify(project);
        const result = await importService.convertV1({file, content});

        expect(result.name).toEqual("TestV1Project");
        expect(result.id).not.toBeNull();
        expect(result.version).toEqual( "v1-to-v2");
        expect(result.securityToken).toEqual("TestV1Project Token");
        expect(result.description).toEqual("Converted V1 Project");
        expect(result.tags).toHaveLength(2);
        // more tests on connection creation?
        expect(result.sourceConnection.name).toEqual("TestV1Project Source Connection");
        expect(result.targetConnection.name).toEqual("TestV1Project Target Connection");
        expect(result.exportFormat).toBeNull();
        expect(result.videoSettings.frameExtractionRate).toBe(15);
        expect(result.autoSave).toBeTruthy();
        // more tests on asset creation?
    });
});