import {styleStore} from './styles-store';

import type {loader} from 'webpack';

export default function (this: loader.LoaderContext, content: string) {

    styleStore.set(this.resourcePath);

    return content;
}