import { bindImpulseEvents } from './bind';
import refreshImpulseComponentList, { updateComponent } from './ajax';

jest.mock('./ajax', () => ({
  __esModule: true,
  default: jest.fn(),
  updateComponent: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('../features/characterCounter', () => ({
  characterCounter: {
    init: jest.fn(),
  },
}));

const mockedRefreshImpulseComponentList = refreshImpulseComponentList as jest.MockedFunction<typeof refreshImpulseComponentList>;
const mockedUpdateComponent = updateComponent as jest.MockedFunction<typeof updateComponent>;

describe('bindImpulseEvents action target resolution', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    mockedRefreshImpulseComponentList.mockClear();
    mockedUpdateComponent.mockClear();
    mockedUpdateComponent.mockResolvedValue(null as any);
  });

  it('calls the closest component for a standard HTML element', async () => {
    document.body.innerHTML = `
      <div data-impulse-id="account-component_1">
        <p id="logout-link" data-action-click="logout">Deconnexion</p>
      </div>
    `;

    bindImpulseEvents();

    document.getElementById('logout-link')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(mockedUpdateComponent).toHaveBeenCalledTimes(1);
    expect(mockedUpdateComponent).toHaveBeenCalledWith('account-component_1', 'logout', undefined, { update: undefined });
  });

  it('falls back from the closest UI component to the parent for propagated wrapper actions', async () => {
    document.body.innerHTML = `
      <div data-impulse-id="register-component_1">
        <uibutton id="save-wrapper" data-action-click="save">
          <div data-impulse-id="u-i-button-component_1">
            <button id="save-button" type="button">Save</button>
          </div>
        </uibutton>
      </div>
    `;

    bindImpulseEvents();

    mockedUpdateComponent
      .mockRejectedValueOnce({ code: 'action_not_found' })
      .mockResolvedValueOnce(null as any);

    document.getElementById('save-button')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(mockedUpdateComponent).toHaveBeenCalledTimes(2);
    expect(mockedUpdateComponent).toHaveBeenNthCalledWith(1, 'u-i-button-component_1', 'save', undefined, { update: undefined });
    expect(mockedUpdateComponent).toHaveBeenNthCalledWith(2, 'register-component_1', 'save', undefined, { update: undefined });
  });

  it('calls the explicit component target when data-action-call is set', async () => {
    document.body.innerHTML = `
      <div data-impulse-id="register-component_1">
        <uibutton id="save-wrapper" data-action-click="save" data-action-call="RegisterComponent">
          <div data-impulse-id="u-i-button-component_1">
            <button id="save-button" type="button">Save</button>
          </div>
        </uibutton>
      </div>
    `;

    bindImpulseEvents();

    document.getElementById('save-button')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(mockedUpdateComponent).toHaveBeenCalledTimes(1);
    expect(mockedUpdateComponent).toHaveBeenCalledWith('register-component_1', 'save', undefined, { update: undefined });
  });
});
