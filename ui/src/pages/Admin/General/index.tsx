import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SchemaForm, JSONSchema, initFormData, UISchema } from '@/components';
import type * as Type from '@/common/interface';
import { useToast } from '@/hooks';
import { siteInfoStore } from '@/stores';
import { useGeneralSetting, updateGeneralSetting } from '@/services';

import '../index.scss';

const General: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.general',
  });
  const Toast = useToast();
  const updateSiteInfo = siteInfoStore((state) => state.update);

  const { data: setting } = useGeneralSetting();
  const schema: JSONSchema = {
    title: t('title'),
    description: t('description'),
    required: ['name', 'site_url', 'contact_email'],
    properties: {
      name: {
        type: 'string',
        title: t('name.label'),
        description: t('name.text'),
      },
      site_url: {
        type: 'string',
        title: t('site_url.label'),
        description: t('site_url.text'),
      },
      short_description: {
        type: 'string',
        title: t('short_description.label'),
        description: t('short_description.text'),
      },
      description: {
        type: 'string',
        title: t('description.label'),
        description: t('description.text'),
      },
      contact_email: {
        type: 'string',
        title: t('contact_email.label'),
        description: t('contact_email.text'),
      },
    },
  };
  const uiSchema: UISchema = {
    site_url: {
      'ui:options': {
        invalid: t('site_url.validate'),
        validator: (value) => {
          if (!/^(https?):\/\/([\w.]+\/?)\S*$/.test(value)) {
            return false;
          }
          return true;
        },
      },
    },
    contact_email: {
      'ui:options': {
        invalid: t('contact_email.validate'),
        validator: (value) => {
          if (
            !/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)
          ) {
            return false;
          }
          return true;
        },
      },
    },
  };
  const [formData, setFormData] = useState(initFormData(schema));

  const onSubmit = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const reqParams: Type.AdminSettingsGeneral = {
      name: formData.name.value,
      description: formData.description.value,
      short_description: formData.short_description.value,
      site_url: formData.site_url.value,
      contact_email: formData.contact_email.value,
    };

    updateGeneralSetting(reqParams)
      .then(() => {
        Toast.onShow({
          msg: t('update', { keyPrefix: 'toast' }),
          variant: 'success',
        });
        updateSiteInfo(reqParams);
      })
      .catch((err) => {
        if (err.isError && err.key) {
          formData[err.key].isInvalid = true;
          formData[err.key].errorMsg = err.value;
        }
        setFormData({ ...formData });
      });
  };

  useEffect(() => {
    if (!setting) {
      return;
    }
    const formMeta = {};
    Object.keys(setting).forEach((k) => {
      formMeta[k] = { ...formData[k], value: setting[k] };
    });
    setFormData({ ...formData, ...formMeta });
  }, [setting]);

  const handleOnChange = (data) => {
    setFormData(data);
  };

  return (
    <>
      <h3 className="mb-4">{t('page_title')}</h3>
      <SchemaForm
        schema={schema}
        formData={formData}
        onSubmit={onSubmit}
        uiSchema={uiSchema}
        onChange={handleOnChange}
      />
    </>
  );
};

export default General;
