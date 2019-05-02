import { mount, ReactWrapper } from "enzyme";
import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import MockFactory from "../../../../common/mockFactory";
import createReduxStore from "../../../../redux/store/store";
import ProjectSettingsPage, { IProjectSettingsPageProps, IProjectSettingsPageState } from "./projectSettingsPage";

jest.mock("../../../../services/projectService");
import ProjectService from "../../../../services/projectService";
jest.mock("../../../../services/assetService");
import { AssetService } from "../../../../services/assetService";

import { IAppSettings, IProject } from "../../../../models/applicationState";
import ProjectMetrics from "./projectMetrics";
import ProjectForm, { IProjectFormProps } from "./projectForm";
import registerMixins from "../../../../registerMixins";
import { TagEditorModal } from "vott-react";

jest.mock("./projectMetrics", () => () => {
    return (
        <div className="project-settings-page-metrics">
            Dummy Project Metrics
        </div>
    );
},
);

describe("Project settings page", () => {
    let projectServiceMock: jest.Mocked<typeof ProjectService> = null;
    let assetServiceMock: jest.Mocked<typeof AssetService> = null;

    function createComponent(store?, props?: IProjectSettingsPageProps): ReactWrapper {
        return mount(
            <Provider store={store || createReduxStore(MockFactory.initialState())}>
                <Router>
                    <ProjectSettingsPage {...props || MockFactory.projectSettingsProps()} />
                </Router>
            </Provider>,
        );
    }

    const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    };

    beforeAll(() => {
        Object.defineProperty(global, "_localStorage", {
            value: localStorageMock,
            writable: false,
        });
        registerMixins();
    });

    beforeEach(() => {
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();

        projectServiceMock = ProjectService as jest.Mocked<typeof ProjectService>;
        projectServiceMock.prototype.load = jest.fn((project) => ({ ...project }));

        assetServiceMock = AssetService as jest.Mocked<typeof AssetService>;
    });

    fit("Form submission calls update tag action", async () => {
        const store = createReduxStore(MockFactory.initialState());
        const props: IProjectSettingsPageProps = {
            ...MockFactory.projectSettingsProps(),
            project: MockFactory.createTestProject(),
        }
        const updateTagSpy = jest.spyOn(props.projectActions, "updateProjectTag");
        assetServiceMock.prototype.renameTag = jest.fn((oldTag: string, newTag: string) => Promise.resolve([]));
        projectServiceMock.prototype.save = jest.fn((project) => Promise.resolve(project));
        const wrapper = createComponent(store, props);

        // Update a tag
        wrapper.find("div.tag").last().simulate("click", { shiftKey: true });
        await MockFactory.flushUi();
        expect(wrapper.exists("input#modal-form_name")).toBe(true);
        const modal = wrapper.find(TagEditorModal).instance() as TagEditorModal;
        const firstTag = props.project.tags[0];
        const newTagName = "New Tag Name";
        modal.props.onOk(firstTag, {...firstTag, name: newTagName});
        
        await MockFactory.flushUi(() => wrapper.find("form").first().simulate("submit"));
        expect(updateTagSpy).toBeCalled();
    });

    it("Form submission calls delete tag action", async () => {
        const store = createReduxStore(MockFactory.initialState());
        const props = MockFactory.projectSettingsProps();
        const deleteTagSpy = jest.spyOn(props.projectActions, "deleteProjectTag");
        assetServiceMock.prototype.deleteTag = jest.fn((tagName: string) => Promise.resolve([]));
        projectServiceMock.prototype.save = jest.fn((project) => Promise.resolve(project));
        const wrapper = createComponent(store, props);

        // Delete a tag
        wrapper.find("a.ReactTags__remove").last().simulate("click");

        await MockFactory.flushUi();

        wrapper.find("form").simulate("submit");
        await MockFactory.flushUi();
        expect(deleteTagSpy).toBeCalled();
    });

    it("Form submission calls save project action", async () => {
        const store = createReduxStore(MockFactory.initialState());
        const props = MockFactory.projectSettingsProps();
        const saveProjectSpy = jest.spyOn(props.projectActions, "saveProject");

        projectServiceMock.prototype.save = jest.fn((project) => Promise.resolve(project));

        const wrapper = createComponent(store, props);
        wrapper.find("form").simulate("submit");
        await MockFactory.flushUi();

        expect(saveProjectSpy).toBeCalled();
    });

    it("Throws an error when a user tries to create a duplicate project", async () => {
        const project = MockFactory.createTestProject("1");
        project.id = "25";
        const initialStateOverride = {
            currentProject: project,
        };
        const store = createReduxStore(MockFactory.initialState(initialStateOverride));
        const props = MockFactory.projectSettingsProps();
        const saveProjectSpy = jest.spyOn(props.projectActions, "saveProject");

        const wrapper = createComponent(store, props);
        wrapper.setProps({
            form: {
                name: project.name,
                connections: {
                    source: project.sourceConnection,
                    target: project.targetConnection,
                },
            },
            actions: {
                saveProject: props.projectActions.saveProject,
            },
        });
        wrapper.find("form").simulate("submit");
        await MockFactory.flushUi();

        expect(saveProjectSpy.mockRejectedValue).not.toBeNull();
    });

    it("calls save project when user creates a unique project", async () => {
        const initialState = MockFactory.initialState();

        // New Project should not have id or security token set by default
        const project = { ...initialState.recentProjects[0] };
        project.id = null;
        project.name = "Brand New Project";
        project.securityToken = "";

        // Override currentProject to load the form values
        initialState.currentProject = project;

        const store = createReduxStore(initialState);
        const props = MockFactory.projectSettingsProps();
        const saveProjectSpy = jest.spyOn(props.projectActions, "saveProject");
        const saveAppSettingsSpy = jest.spyOn(props.applicationActions, "saveAppSettings");

        projectServiceMock.prototype.save = jest.fn((project) => Promise.resolve(project));
        const wrapper = createComponent(store, props);
        wrapper.find("form").simulate("submit");

        await MockFactory.flushUi();

        // New security token was created for new project
        expect(saveAppSettingsSpy).toBeCalled();
        const appSettings = saveAppSettingsSpy.mock.calls[0][0] as IAppSettings;
        expect(appSettings.securityTokens.length).toEqual(initialState.appSettings.securityTokens.length + 1);

        // New project was saved with new security token
        expect(saveProjectSpy).toBeCalledWith({
            ...project,
            securityToken: `${project.name} Token`,
        });

        expect(localStorage.removeItem).toBeCalledWith("projectForm");
    });

    it("render ProjectMetrics", () => {
        const store = createReduxStore(MockFactory.initialState());
        const props = MockFactory.projectSettingsProps();

        const wrapper = createComponent(store, props);
        const projectMetrics = wrapper.find(ProjectMetrics);
        expect(projectMetrics).toHaveLength(1);
    });

    describe("project does not exist", () => {
        it("does not render ProjectMetrics", () => {
            const initialState = MockFactory.initialState();

            // Override currentProject to load the form values
            initialState.currentProject = null;

            const store = createReduxStore(initialState);
            const props = MockFactory.projectSettingsProps();

            const wrapper = createComponent(store, props);
            const projectMetrics = wrapper.find(".project-settings-page-metrics");
            expect(projectMetrics).toHaveLength(0);
        });
    });

    describe("Persisting project form", () => {
        let wrapper: ReactWrapper = null;

        function initPersistProjectFormTest() {
            const store = createReduxStore(MockFactory.initialState());
            const props = MockFactory.projectSettingsProps();
            props.match.url = "/projects/create";
            wrapper = createComponent(store, props);
        }

        it("Loads partial project from local storage", () => {
            const partialProject: IProject = {
                ...{} as any,
                name: "partial project",
                description: "partial project description",
                tags: [
                    { name: "tag-1", color: "#ff0000" },
                    { name: "tag-3", color: "#ffff00" },
                ],
            };

            localStorageMock.getItem.mockImplementationOnce(() => JSON.stringify(partialProject));

            initPersistProjectFormTest();
            const projectSettingsPage = wrapper
                .find(ProjectSettingsPage)
                .childAt(0) as ReactWrapper<IProjectSettingsPageProps, IProjectSettingsPageState>;

            expect(localStorage.getItem).toBeCalledWith("projectForm");
            expect(projectSettingsPage.state().project).toEqual(partialProject);
        });

        it("Stores partial project in local storage", () => {
            initPersistProjectFormTest();
            const partialProject: IProject = {
                ...{} as any,
                name: "partial project",
            };

            const projectForm = wrapper.find(ProjectForm) as ReactWrapper<IProjectFormProps>;
            projectForm.props().onChange(partialProject);

            expect(localStorage.setItem).toBeCalledWith("projectForm", JSON.stringify(partialProject));
        });

        it("Does NOT store empty project in local storage", () => {
            initPersistProjectFormTest();
            const emptyProject: IProject = {
                ...{} as any,
                sourceConnection: {},
                targetConnection: {},
                exportFormat: {},
            };
            const projectForm = wrapper.find(ProjectForm) as ReactWrapper<IProjectFormProps>;
            projectForm.props().onChange(emptyProject);

            expect(localStorage.setItem).not.toBeCalled();
        });
    });
});
