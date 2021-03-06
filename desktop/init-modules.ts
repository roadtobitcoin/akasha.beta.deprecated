import jsonSchemaWeb3 from '@akashaproject/jsonschema-web3';
import { CORE_MODULE } from '@akashaproject/common/constants';
import { GethConnector } from '@akashaproject/geth-connector';
import { IpfsConnector } from '@akashaproject/ipfs-connector';
import { app } from 'electron';
import { join, sep } from 'path';
import core from '@akashaproject/core';
import commonModule from '@akashaproject/common';
import authModule from '@akashaproject/auth';
import commentsModule from '@akashaproject/comments';
import entryModule from '@akashaproject/entry';
import gethModule from '@akashaproject/geth';
import ipfsModule from '@akashaproject/ipfs';
import licencesModule from '@akashaproject/licences';
import notificationsModule from '@akashaproject/notifications';
import pinnerModule from '@akashaproject/pinner';
import profileModule from '@akashaproject/profile';
import registryModule from '@akashaproject/registry';
import searchModule from '@akashaproject/search';
import { init } from '@akashaproject/search/indexes';
import tagsModule from '@akashaproject/tags';
import txModule from '@akashaproject/tx';

const bootstrap = async function bootstrap(serviceProvider, gS, logger) {
  core.init();
  const common = commonModule.init(serviceProvider, gS);
  const auth = authModule.init(serviceProvider, gS);
  const comments = commentsModule.init(serviceProvider, gS);
  const entry = entryModule.init(serviceProvider, gS);
  const geth = gethModule.init(serviceProvider, gS);
  const ipfs = ipfsModule.init(serviceProvider, gS);
  const licences = licencesModule.init(serviceProvider, gS);
  const notifications = notificationsModule.init(serviceProvider, gS);
  const pinner = pinnerModule.init(serviceProvider, gS);
  const profile = profileModule.init(serviceProvider, gS);
  const registry = registryModule.init(serviceProvider, gS);
  const search = searchModule.init(serviceProvider, gS);
  const tags = tagsModule.init(serviceProvider, gS);
  const tx = txModule.init(serviceProvider, gS);
  const serviceValidator = function () {
    return { Validator: jsonSchemaWeb3 };
  };
  const gethLogger = logger.child({ module: 'geth' });
  const ipfsLogger = logger.child({ module: 'ipfs' });
  gS(CORE_MODULE.WEB3_API).instance = GethConnector.getInstance().web3;
  gS(CORE_MODULE.IPFS_API).instance = IpfsConnector.getInstance();
  GethConnector.getInstance().setLogger(gethLogger);
  IpfsConnector.getInstance().setLogger(ipfsLogger);

  GethConnector.getInstance().setBinPath(join(app.getPath('userData'), 'go-ethereum'));
  GethConnector.getInstance().setOptions({
    datadir: join(GethConnector.getDefaultDatadir(), 'rinkeby'),
    ipcpath: join(GethConnector.getDefaultDatadir().replace(':', '\\'), 'rinkeby', 'geth.ipc'),
    networkid: 4,
    syncmode: 'fast',
    rinkeby: '',
  });
  serviceProvider().service(CORE_MODULE.VALIDATOR_SCHEMA, serviceValidator);
  serviceProvider().service(CORE_MODULE.GETH_CONNECTOR, function () {
    return GethConnector;
  });
  serviceProvider().service(CORE_MODULE.IPFS_CONNECTOR, function () {
    return IpfsConnector;
  });
  const prefix = app.getPath('userData') + sep;
  await init(prefix)
    .then(() => logger.debug('Finished init local db.'))
    .catch(err => logger.error(err));
  return {
    [commonModule.moduleName]: common,
    [authModule.moduleName]: auth,
    [commentsModule.moduleName]: comments,
    [entryModule.moduleName]: entry,
    [gethModule.moduleName]: geth,
    [ipfsModule.moduleName]: ipfs,
    [licencesModule.moduleName]: licences,
    [notificationsModule.moduleName]: notifications,
    [pinnerModule.moduleName]: pinner,
    [profileModule.moduleName]: profile,
    [registryModule.moduleName]: registry,
    [searchModule.moduleName]: search,
    [tagsModule.moduleName]: tags,
    [txModule.moduleName]: tx,
  };
};

export default bootstrap;
