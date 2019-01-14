import { mount } from "enzyme";
import React from "react";
import EditorFooter from "./editorFooter";
// tslint:disable-next-line:no-var-requires
const TagColors = require("../../common/tagsInput/tagColors.json");

describe("Footer Component", () => {
    let wrapper: any = null;
    let onChangeHandler: (value: any) => void;

    const originalTags = [
        {
            name: "Tag1",
            color: "#800000",
        },
        {
            name: "Tag2",
            color: "#008080",
        },
    ];

    beforeEach(() => {
        onChangeHandler = jest.fn();
        wrapper = mount(
            <EditorFooter
                tags={originalTags}
                displayHotKeys={true}
                onTagsChanged={onChangeHandler} />,
        );
    });

    it("tags are initialized correctly", () => {
        const stateTags = wrapper.state().tags;
        expect(stateTags).toEqual(originalTags);
    });

    it("tags are empty", () => {
        const emptyWrapper = mount(
            <EditorFooter
                tags={[]}
                displayHotKeys={true}
                onTagsChanged={onChangeHandler} />,
        );
        const stateTags = emptyWrapper.state()["tags"];
        expect(stateTags).toEqual([]);
    });

    it("create a new tag from text box", () => {
        const newTagName = "My new tag";
        wrapper.find("input").simulate("change", { target: { value: newTagName } });
        wrapper.find("input").simulate("keyDown", { keyCode: 13 });
        expect(onChangeHandler).toBeCalled();
        expect(wrapper.state().tags).toHaveLength(3);
        expect(wrapper.state().tags[2].name).toEqual(newTagName);
        expect(TagColors).toContain(wrapper.state().tags[2].color);
    });

    it("remove a tag", () => {
        expect(wrapper.state().tags).toHaveLength(2);
        wrapper.find("a.ReactTags__remove")
            .last().simulate("click");
        expect(onChangeHandler).toBeCalled();
        expect(wrapper.state().tags).toHaveLength(1);
        expect(wrapper.state().tags[0].name).toEqual(originalTags[0].name);
        expect(wrapper.state().tags[0].color).toEqual(originalTags[0].color);
    });

    it("clicking 'ok' in modal closes and calls onChangeHandler", () => {
        wrapper.find("div.tag")
            .first()
            .simulate("click", { target: { innerText: originalTags[0].name }, ctrlKey: true});
        wrapper.find("button.btn.btn-success").simulate("click");
        expect(onChangeHandler).toBeCalled();
    });

    it("clicking 'cancel' in modal closes and does not call onChangeHandler", () => {
        wrapper.find("div.tag")
            .first()
            .simulate("click", { target: { innerText: originalTags[0].name }, ctrlKey: true});
        wrapper.find("button.btn.btn-secondary").simulate("click");

        expect(onChangeHandler).not.toBeCalled();
    });

});
