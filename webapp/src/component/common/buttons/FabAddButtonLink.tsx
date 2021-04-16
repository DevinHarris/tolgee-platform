import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';
import {Link} from 'react-router-dom';
import {useTranslate} from "@tolgee/react";
import {Box} from "@material-ui/core";


export function FabAddButtonLink(props: { to: string }) {
    const t = useTranslate();

    return (
        <Box mt={2}>
            <Fab color="primary" data-cy="global-plus-button" aria-label={t("button_add_aria_label", undefined, true)} component={Link} {...props}>
                <AddIcon/>
            </Fab>
        </Box>
    );
}