/* eslint-disable react-doctor/async-await-in-loop */
'use client';

import React, { useCallback, useMemo, useRef, useReducer } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Grid,
  Label,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui';
import {
  PatchEvent,
  insert,
  set,
  setIfMissing,
  unset,
  useClient,
  useFormValue,
} from 'sanity';

import { apiVersion } from '../env';

// ==========================================
// 1. UTILITAIRES & RÉDUCTEUR
// ==========================================

function createKey() {
  if (globalThis?.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

function stripExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx > 0 ? filename.slice(0, idx) : filename;
}

function assetRefToUrl(ref, projectId, dataset, options = '') {
  if (!ref || !projectId || !dataset) return null;
  const withoutPrefix = ref.replace(/^image-/, '');
  const lastDash = withoutPrefix.lastIndexOf('-');
  if (lastDash === -1) return null;
  const format = withoutPrefix.slice(lastDash + 1);
  const withoutFormat = withoutPrefix.slice(0, lastDash);
  const secondLastDash = withoutFormat.lastIndexOf('-');
  if (secondLastDash === -1) return null;
  const id = withoutFormat.slice(0, secondLastDash);
  const dimensions = withoutFormat.slice(secondLastDash + 1);
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}${options}`;
}

const initialState = {
  isUploading: false,
  status: '',
  selectedKeys: new Set(),
  editingImage: null,
  editAlt: { fr: '', en: '', de: '' },
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPLOAD_START':
      return { ...state, isUploading: true, status: action.status };
    case 'UPLOAD_PROGRESS':
      return { ...state, status: action.status };
    case 'UPLOAD_FINISH':
      return { ...state, isUploading: false, status: action.status || '' };
    case 'TOGGLE_KEY': {
      const nextKeys = new Set(state.selectedKeys);
      if (nextKeys.has(action.key)) nextKeys.delete(action.key);
      else nextKeys.add(action.key);
      return { ...state, selectedKeys: nextKeys };
    }
    case 'SET_SELECTED_KEYS':
      return { ...state, selectedKeys: action.keys };
    case 'OPEN_EDIT':
      return {
        ...state,
        editingImage: action.image,
        editAlt: {
          fr: action.image?.alt?.fr ?? '',
          en: action.image?.alt?.en ?? '',
          de: action.image?.alt?.de ?? '',
        },
      };
    case 'CLOSE_EDIT':
      return { ...state, editingImage: null };
    case 'UPDATE_EDIT_ALT':
      return {
        ...state,
        editAlt: { ...state.editAlt, [action.lang]: action.value },
      };
    default:
      return state;
  }
}

// ==========================================
// 2. SOUS-COMPOSANTS UI
// ==========================================

function UploadSection({ isUploading, status, onFilesSelected }) {
  const folderInputRef = useRef(null);
  const filesInputRef = useRef(null);

  const handleInput = async (e, isFolder) => {
    if (e.currentTarget.files) {
      await onFilesSelected(e.currentTarget.files);
    }
    // Réinitialisation des inputs
    if (isFolder && folderInputRef.current) folderInputRef.current.value = '';
    if (!isFolder && filesInputRef.current) filesInputRef.current.value = '';
  };

  return (
    <Card padding={3} radius={2} border>
      <Stack space={2}>
        <Flex gap={2} wrap="wrap">
          <Button
            mode="default"
            text="Importer un dossier"
            disabled={isUploading}
            onClick={() => folderInputRef.current?.click()}
          />
          <Button
            mode="default"
            text="Importer des images"
            disabled={isUploading}
            onClick={() => filesInputRef.current?.click()}
          />
          {isUploading ? <Text size={1}>Upload en cours…</Text> : null}
        </Flex>

        {status ? <Text size={1}>{status}</Text> : null}

        {/* CORRECTION : Retrait de l'attribut non-standard `directory="true"` */}
        <input
          aria-label="folder input"
          ref={folderInputRef}
          type="file"
          multiple
          accept="image/*"
          webkitdirectory="true"
          className="hidden"
          onChange={e => handleInput(e, true)}
        />
        <input
          aria-label="files input"
          ref={filesInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleInput(e, false)}
        />
        <Text size={1} muted>
          Le texte alternatif est auto-rempli comme “Nom du projet + numéro”.
        </Text>
      </Stack>
    </Card>
  );
}

function ImageGridItem({ image, isSelected, url, onToggle, onEdit }) {
  return (
    <Card
      padding={1}
      radius={2}
      border
      tone={isSelected ? 'critical' : 'default'}
      style={{ position: 'relative', userSelect: 'none' }}
    >
      <button
        type="button"
        aria-label={`Modifier le texte alternatif de l'image ${image._key}`}
        style={{ cursor: 'pointer', width: '100%' }}
        onClick={() => onEdit(image)}
      >
        {url ? (
          <div
            className="w-full aspect-square rounded-[2px] block bg-no-repeat bg-center bg-cover opacity-100 transition-opacity duration-300"
            style={{ backgroundImage: `url(${url})` }}
          />
        ) : (
          <div className="w-full aspect-square bg-[#e0e0e0] rounded-[2px]" />
        )}
      </button>
      <div
        style={{ position: 'absolute', top: 4, right: 4 }}
        onClick={e => e.stopPropagation()}
      >
        <Checkbox checked={isSelected} onChange={() => onToggle(image._key)} />
      </div>
    </Card>
  );
}

function ImageGridSection({
  images,
  effectiveSelectedKeys,
  projectId,
  dataset,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onToggleKey,
  onOpenEdit,
}) {
  if (images.length === 0) return null;

  return (
    <Card padding={3} radius={2} border tone="caution">
      <Stack space={3}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <Text size={1} weight="semibold">
            {`Images du projet (${images.length} au total)`}
          </Text>
          <Flex gap={2} wrap="wrap" align="center">
            {effectiveSelectedKeys.size < images.length && (
              <Button
                mode="ghost"
                fontSize={1}
                text="Tout sélectionner"
                onClick={onSelectAll}
              />
            )}
            {effectiveSelectedKeys.size > 0 && (
              <>
                <Button
                  mode="ghost"
                  fontSize={1}
                  text="Déselectionner"
                  onClick={onClearSelection}
                />
                <Button
                  mode="default"
                  tone="critical"
                  fontSize={1}
                  text={`Supprimer ${effectiveSelectedKeys.size} image(s)`}
                  onClick={onDeleteSelected}
                />
              </>
            )}
          </Flex>
        </Flex>

        <Grid columns={6} gap={2}>
          {images.map(image => {
            const url = assetRefToUrl(
              image?.asset?._ref,
              projectId,
              dataset,
              '?w=120&h=120&fit=crop&auto=format'
            );
            return (
              <ImageGridItem
                key={image._key}
                image={image}
                isSelected={effectiveSelectedKeys.has(image._key)}
                url={url}
                onToggle={onToggleKey}
                onEdit={onOpenEdit}
              />
            );
          })}
        </Grid>

        {effectiveSelectedKeys.size > 0 && (
          <Text size={1} muted>
            {effectiveSelectedKeys.size} image(s) sélectionnée(s) sur{' '}
            {images.length}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function EditAltDialog({
  editingImage,
  editAlt,
  previewUrl,
  onClose,
  onSave,
  onUpdateAlt,
}) {
  if (!editingImage) return null;

  return (
    <Dialog
      id="edit-image-dialog"
      header="Modifier le texte alternatif"
      onClose={onClose}
      width={1}
      footer={
        <Flex padding={3} gap={2} justify="space-between" wrap="wrap">
          <Flex gap={2}>
            <Button mode="ghost" text="Annuler" onClick={onClose} />
            <Button
              mode="default"
              tone="primary"
              text="Enregistrer"
              onClick={onSave}
            />
          </Flex>
        </Flex>
      }
    >
      <Stack space={4} padding={4}>
        {previewUrl && (
          <Card radius={2} overflow="hidden" border>
            <div
              className="w-full max-h-[300px] aspect-video bg-[#111] bg-no-repeat bg-center bg-contain"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          </Card>
        )}

        <Stack space={1}>
          <Text size={2} weight="semibold">
            Texte Alternatif (SEO)
          </Text>
          <Text size={1} muted>
            Description de l&apos;image pour l&apos;accessibilité et le SEO
          </Text>
        </Stack>

        <Stack space={2}>
          <Label size={1}>Français</Label>
          <TextInput
            value={editAlt.fr}
            onChange={e => onUpdateAlt('fr', e.currentTarget.value)}
          />
        </Stack>

        <Stack space={2}>
          <Label size={1}>Anglais</Label>
          <TextInput
            value={editAlt.en}
            onChange={e => onUpdateAlt('en', e.currentTarget.value)}
          />
        </Stack>

        <Stack space={2}>
          <Label size={1}>Allemand</Label>
          <TextInput
            value={editAlt.de}
            onChange={e => onUpdateAlt('de', e.currentTarget.value)}
          />
        </Stack>
      </Stack>
    </Dialog>
  );
}

// ==========================================
// 3. COMPOSANT PRINCIPAL
// ==========================================

export default function ProjectImagesFolderInput(props) {
  const { onChange, value, renderDefault } = props;

  const client = useClient({ apiVersion });
  const { projectId, dataset } = client.config();

  const nameFr = useFormValue(['name', 'fr']);
  const nameEn = useFormValue(['name', 'en']);
  const nameDe = useFormValue(['name', 'de']);

  const fallbackName = useMemo(() => {
    return (
      (typeof nameFr === 'string' && nameFr.trim()) ||
      (typeof nameEn === 'string' && nameEn.trim()) ||
      (typeof nameDe === 'string' && nameDe.trim()) ||
      ''
    );
  }, [nameFr, nameEn, nameDe]);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { isUploading, status, selectedKeys, editingImage, editAlt } = state;

  const handleFilesSelected = async fileList => {
    const allFiles = Array.from(fileList || []);
    const imageFiles = allFiles
      .filter(
        file =>
          file &&
          typeof file.type === 'string' &&
          file.type.startsWith('image/')
      )
      .sort((a, b) => {
        const ap = a.webkitRelativePath || a.name;
        const bp = b.webkitRelativePath || b.name;
        return ap.localeCompare(bp, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });

    if (imageFiles.length === 0) return;

    const currentCount = Array.isArray(value) ? value.length : 0;
    dispatch({
      type: 'UPLOAD_START',
      status: `Upload de ${imageFiles.length} image(s)…`,
    });

    try {
      const newItems = [];
      const baseFr =
        (typeof nameFr === 'string' && nameFr.trim()) || fallbackName;
      const baseEn =
        (typeof nameEn === 'string' && nameEn.trim()) || fallbackName;
      const baseDe =
        (typeof nameDe === 'string' && nameDe.trim()) || fallbackName;

      for (let i = 0; i < imageFiles.length; i += 1) {
        const file = imageFiles[i];
        const photoNumber = currentCount + i + 1;
        const safeBase = fallbackName || stripExtension(file.name) || 'Projet';

        const alt = {
          fr: `${baseFr || safeBase} ${photoNumber}`,
          en: `${baseEn || safeBase} ${photoNumber}`,
          de: `${baseDe || safeBase} ${photoNumber}`,
        };

        dispatch({
          type: 'UPLOAD_PROGRESS',
          status: `Upload ${i + 1}/${imageFiles.length} : ${file.name}`,
        });

        const asset = await client.assets.upload('image', file, {
          filename: file.name,
        });

        newItems.push({
          _type: 'image',
          _key: createKey(),
          asset: { _type: 'reference', _ref: asset._id },
          alt,
        });
      }

      onChange(
        PatchEvent.from([setIfMissing([]), insert(newItems, 'after', [-1])])
      );
      dispatch({
        type: 'UPLOAD_FINISH',
        status: `Ajouté ${newItems.length} image(s).`,
      });
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'UPLOAD_FINISH',
        status: `Erreur pendant l'upload : ${err?.message || 'échec inconnu'}`,
      });
    }
  };

  const images = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const effectiveSelectedKeys = useMemo(() => {
    const result = new Set();
    for (const img of images) {
      if (selectedKeys.has(img._key)) {
        result.add(img._key);
      }
    }
    return result;
  }, [images, selectedKeys]);

  const toggleKey = useCallback(
    key => {
      if (!images.some(img => img._key === key)) return;
      dispatch({ type: 'TOGGLE_KEY', key });
    },
    [images]
  );

  const handleSelectAll = useCallback(() => {
    dispatch({
      type: 'SET_SELECTED_KEYS',
      keys: new Set(images.map(img => img._key)),
    });
  }, [images]);

  const handleClearSelection = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_KEYS', keys: new Set() });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (effectiveSelectedKeys.size === 0) return;
    onChange(
      PatchEvent.from(
        Array.from(effectiveSelectedKeys).map(key => unset([{ _key: key }]))
      )
    );
    dispatch({ type: 'SET_SELECTED_KEYS', keys: new Set() });
  }, [effectiveSelectedKeys, onChange]);

  const openEditModal = useCallback(
    image => dispatch({ type: 'OPEN_EDIT', image }),
    []
  );

  const handleUpdateAlt = useCallback((lang, val) => {
    dispatch({ type: 'UPDATE_EDIT_ALT', lang, value: val });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingImage) return;
    const makePatch = (langCode, val) =>
      val
        ? set(val, [{ _key: editingImage._key }, 'alt', langCode])
        : unset([{ _key: editingImage._key }, 'alt', langCode]);

    onChange(
      PatchEvent.from([
        makePatch('fr', editAlt.fr),
        makePatch('en', editAlt.en),
        makePatch('de', editAlt.de),
      ])
    );
    dispatch({ type: 'CLOSE_EDIT' });
  }, [editingImage, editAlt, onChange]);

  const editingImagePreviewUrl = useMemo(
    () =>
      assetRefToUrl(
        editingImage?.asset?._ref,
        projectId,
        dataset,
        '?w=1200&auto=format'
      ),
    [editingImage?.asset?._ref, projectId, dataset]
  );

  return (
    <Stack space={3}>
      <UploadSection
        isUploading={isUploading}
        status={status}
        onFilesSelected={handleFilesSelected}
      />

      <ImageGridSection
        images={images}
        effectiveSelectedKeys={effectiveSelectedKeys}
        projectId={projectId}
        dataset={dataset}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        onToggleKey={toggleKey}
        onOpenEdit={openEditModal}
      />

      {renderDefault ? (
        <Card padding={3} radius={2} border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Liste native Sanity
            </Text>
            {/* eslint-disable-next-line react-doctor/no-render-in-render */}
            {renderDefault(props)}
          </Stack>
        </Card>
      ) : null}

      <EditAltDialog
        editingImage={editingImage}
        editAlt={editAlt}
        previewUrl={editingImagePreviewUrl}
        onClose={() => dispatch({ type: 'CLOSE_EDIT' })}
        onSave={handleSaveEdit}
        onUpdateAlt={handleUpdateAlt}
      />
    </Stack>
  );
}
