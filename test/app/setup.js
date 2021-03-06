import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import Channel from './helpers/channels';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createActionChannels } from '../../app/local-flux/sagas/helpers';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = global.window.navigator;

before('init tests', function () {
    this.sandbox = sinon.createSandbox();
    createActionChannels(Channel);
    Enzyme.configure({
        adapter: new Adapter()
    });
});
