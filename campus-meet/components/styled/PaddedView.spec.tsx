import { render, fireEvent } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";

import PaddedView from "./PaddedView";

describe("PaddedView", () => {
  it("renders with correct padding", () => {
    const { getByTestId } = render(
      <PaddedView testID="padded-view">
        <View />
      </PaddedView>
    );

    const view = getByTestId("padded-view");
    expect(view).toHaveStyle({
      paddingTop: 15,
      paddingHorizontal: 15,
    });
  });

  it("passes through other props", () => {
    const onPress = jest.fn();

    const { getByTestId } = render(
      <PaddedView testID="padded-view" onPress={onPress}>
        <View />
      </PaddedView>
    );

    const view = getByTestId("padded-view");
    fireEvent.press(view);

    expect(onPress).toHaveBeenCalled();
  });

  it("renders children", () => {
    const { getByTestId } = render(
      <PaddedView testID="padded-view">
        <View testID="child-view" />
      </PaddedView>
    );

    const childView = getByTestId("child-view");
    expect(childView).toBeDefined();
  });

  it("applies padding", () => {
    const { getByTestId } = render(
      <PaddedView testID="padded-view" style={{ height: 100 }}>
        <View testID="child-view" />
      </PaddedView>
    );

    const paddedView = getByTestId("padded-view");
    expect(paddedView).toHaveStyle({
      paddingTop: 15,
      paddingHorizontal: 15,
      flex: 1,
    });
  });

  it("renders with custom padding", () => {
    const customPadding = 15;
    const { getByTestId } = render(
      <PaddedView testID="padded-view" padding={customPadding}>
        <View />
      </PaddedView>
    );

    const view = getByTestId("padded-view");
    expect(view).toHaveStyle({
      paddingTop: customPadding,
      paddingHorizontal: customPadding,
    });
  });
});
