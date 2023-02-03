// changes the type to a mocked version of this function
// does not has functionality impact
export const mockedFunctionType = <T extends (...args: any[]) => any>(
  func: T
) => func as jest.MockedFunction<T>;

export const mockedClassType = <T extends new (...args: any[]) => any>(c: T) =>
  c as jest.MockedClass<T>;
