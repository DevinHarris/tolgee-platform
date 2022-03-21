import { useMemo } from 'react';
import { Formik, Field } from 'formik';
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  DialogContent,
  TextField,
  makeStyles,
  ButtonGroup,
  Box,
  Typography,
} from '@material-ui/core';
import { container } from 'tsyringe';
import { useTranslate, T } from '@tolgee/react';
import copy from 'copy-to-clipboard';
import * as Yup from 'yup';

import { useApiMutation } from 'tg.service/http/useQueryApi';
import { components } from 'tg.service/apiSchema.generated';
import LoadingButton from 'tg.component/common/form/LoadingButton';
import { LINKS, PARAMS } from 'tg.constants/links';
import { parseErrorResponse } from 'tg.fixtures/errorFIxtures';
import { MessageService } from 'tg.service/MessageService';
import { useOrganization } from '../useOrganization';
import { RoleMenu } from 'tg.component/security/RoleMenu';

const messaging = container.resolve(MessageService);

type RoleType = NonNullable<
  components['schemas']['OrganizationInviteUserDto']['roleType']
>;

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minHeight: 150,
  },
  permissions: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
};

export const InviteDialog: React.FC<Props> = ({ open, onClose }) => {
  const classes = useStyles();
  const t = useTranslate();
  const organization = useOrganization();
  const invite = useApiMutation({
    url: '/v2/organizations/{id}/invite',
    method: 'put',
    invalidatePrefix: '/v2/organizations/{organizationId}/invitations',
  });

  const yupSchema = useMemo(
    () =>
      Yup.object({
        permission: Yup.string(),
        permissionLanguages: Yup.array(Yup.string()),
        type: Yup.string(),
        text: Yup.string().when('type', (val: string) =>
          val === 'email'
            ? Yup.string()
                .email(t('validation_email_is_not_valid'))
                .required(t('Validation - required field'))
            : Yup.string().required(t('Validation - required field'))
        ),
      }),
    [t]
  );

  return (
    <Dialog {...{ open, onClose }} fullWidth>
      <Formik
        initialValues={{
          role: 'MEMBER' as RoleType,
          permissionLanguages: [],
          type: 'email' as 'email' | 'link',
          text: '',
        }}
        validationSchema={yupSchema}
        isInitialValid={false}
        onSubmit={(data) => {
          invite.mutate(
            {
              path: { id: organization!.id },
              content: {
                'application/json': {
                  roleType: data.role,
                  email: data.type === 'email' ? data.text : undefined,
                  name: data.type === 'link' ? data.text : undefined,
                },
              },
            },
            {
              onSuccess(data) {
                copy(
                  LINKS.ACCEPT_INVITATION.buildWithOrigin({
                    [PARAMS.INVITATION_CODE]: data.code,
                  })
                );
                messaging.success(
                  <T keyName="invite_user_invitation_copy_success" />
                );
                onClose();
              },
              onError(e) {
                parseErrorResponse(e).forEach((e) =>
                  messaging.error(<T>{e}</T>)
                );
              },
            }
          );
        }}
      >
        {({ values, handleSubmit, isValid, ...formik }) => {
          return (
            <form onSubmit={handleSubmit}>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between">
                  <span>{t('project_members_dialog_title')}</span>
                  <ButtonGroup>
                    <Button
                      size="small"
                      disableElevation
                      color={values.type === 'email' ? 'primary' : undefined}
                      onClick={() => formik.setFieldValue('type', 'email')}
                    >
                      Email
                    </Button>
                    <Button
                      size="small"
                      disableElevation
                      color={values.type === 'link' ? 'primary' : undefined}
                      onClick={() => formik.setFieldValue('type', 'link')}
                    >
                      Link
                    </Button>
                  </ButtonGroup>
                </Box>
              </DialogTitle>
              <DialogContent>
                <div className={classes.content}>
                  <div>
                    <Typography variant="caption">
                      {t('invite_user_organization_role_label')}
                    </Typography>
                    <div className={classes.permissions}>
                      <RoleMenu
                        role={values.role}
                        onSelect={(role) => formik.setFieldValue('role', role)}
                        buttonProps={{
                          size: 'small',
                        }}
                      />
                    </div>
                  </div>

                  <Field name="text">
                    {({ field, meta }) => (
                      <TextField
                        type={values.type === 'email' ? 'email' : 'text'}
                        label={
                          values.type === 'email'
                            ? t('project_members_dialog_email')
                            : t('project_members_dialog_name')
                        }
                        error={meta.touched && meta.error}
                        helperText={meta.touched && meta.error}
                        {...field}
                      />
                    )}
                  </Field>
                </div>
              </DialogContent>
              <DialogActions>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!isValid}
                >
                  {values.type === 'email'
                    ? t('project_members_dialog_invite_button')
                    : t('project_members_dialog_create_link_button')}
                </LoadingButton>
              </DialogActions>
            </form>
          );
        }}
      </Formik>
    </Dialog>
  );
};