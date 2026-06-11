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

// 1. Define Initial State
const initialState = {
  isUploading: false,
  status: '',
  selectedKeys: new Set(),
  editingImage: null,
  editAlt: { fr: '', en: '', de: '' },
};

// 2. Define the Single Reducer
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

  const folderInputRef = useRef(null);
  const filesInputRef = useRef(null);

  // 3. Consume the grouped state
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isUploading, status, selectedKeys, editingImage, editAlt } = state;

  async function handleFilesSelected(fileList) {
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

      for (let i = 0; i < imageFiles.length; i += 1) {
        const file = imageFiles[i];
        const photoNumber = currentCount + i + 1;

        const baseFr =
          (typeof nameFr === 'string' && nameFr.trim()) || fallbackName;
        const baseEn =
          (typeof nameEn === 'string' && nameEn.trim()) || fallbackName;
        const baseDe =
          (typeof nameDe === 'string' && nameDe.trim()) || fallbackName;

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
    } finally {
      if (folderInputRef.current) folderInputRef.current.value = '';
      if (filesInputRef.current) filesInputRef.current.value = '';
    }
  }

  const images = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  const effectiveSelectedKeys = useMemo(
    () =>
      new Set(
        images
          .filter(img => selectedKeys.has(img._key))
          .map(img => img._key)
          .reduce((acc, key) => {
            if (!acc.includes(key)) acc.push(key);
            return acc;
          }, [])
      ),
    [images, selectedKeys]
  );

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

  const openEditModal = useCallback(image => {
    dispatch({ type: 'OPEN_EDIT', image });
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

          <input
            aria-label="folder input"
            ref={folderInputRef}
            type="file"
            multiple
            accept="image/*"
            webkitdirectory="true"
            directory="true"
            className="hidden"
            onChange={e => handleFilesSelected(e.currentTarget.files)}
          />

          <input
            aria-label="files input"
            ref={filesInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFilesSelected(e.currentTarget.files)}
          />

          <Text size={1} muted>
            Le texte alternatif est auto-rempli comme “Nom du projet + numéro”.
          </Text>
        </Stack>
      </Card>

      {images.length > 0 && (
        <Card padding={3} radius={2} border tone="caution">
          <Stack space={3}>
            <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
              <Text size={1} weight="semibold">
                {`Supprimer des images (${images.length} au total)`}
              </Text>
              <Flex gap={2} wrap="wrap" align="center">
                {effectiveSelectedKeys.size < images.length && (
                  <Button
                    mode="ghost"
                    fontSize={1}
                    text="Tout sélectionner"
                    onClick={handleSelectAll}
                  />
                )}
                {effectiveSelectedKeys.size > 0 && (
                  <>
                    <Button
                      mode="ghost"
                      fontSize={1}
                      text="Déselectionner"
                      onClick={handleClearSelection}
                    />
                    <Button
                      mode="default"
                      tone="critical"
                      fontSize={1}
                      text={`Supprimer ${effectiveSelectedKeys.size} image(s)`}
                      onClick={handleDeleteSelected}
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
                const isSelected = effectiveSelectedKeys.has(image._key);
                return (
                  <Card
                    key={image._key}
                    padding={1}
                    radius={2}
                    border
                    tone={isSelected ? 'critical' : 'default'}
                    style={{ position: 'relative', userSelect: 'none' }}
                  >
                    <button
                      type="button"
                      aria-label={`Modifier le texte alternatif de l'image ${image._key}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => openEditModal(image)}
                      onKeyPress={e => {
                        if (e.key === 'Enter') openEditModal(image);
                      }}
                      tabIndex={0}
                    >
                      {url ? (
                        <div
                          role="button"
                          aria-label="Aperçu de l'image"
                          className="w-full aspect-square rounded-[2px] block bg-no-repeat bg-center bg-cover opacity-100 transition-opacity duration-300"
                          style={{ backgroundImage: `url(${url})` }}
                        />
                      ) : (
                        <div
                          role="button"
                          aria-label={`Modifier le texte alternatif de l'image ${image._key}`}
                          className="w-full aspect-square bg-[#e0e0e0] rounded-[2px]"
                        />
                      )}
                    </button>
                    <div
                      style={{ position: 'absolute', top: 4, right: 4 }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleKey(image._key)}
                      />
                    </div>
                  </Card>
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
      )}

      {renderDefault ? (
        <Card padding={3} radius={2} border>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Liste native Sanity
            </Text>
            {renderDefault(props)}
          </Stack>
        </Card>
      ) : null}

      {editingImage && (
        <Dialog
          id="edit-image-dialog"
          header="Modifier le texte alternatif"
          onClose={() => dispatch({ type: 'CLOSE_EDIT' })}
          width={1}
          footer={
            <Flex padding={3} gap={2} justify="space-between" wrap="wrap">
              <Flex gap={2}>
                <Button
                  mode="ghost"
                  text="Annuler"
                  onClick={() => dispatch({ type: 'CLOSE_EDIT' })}
                />
                <Button
                  mode="default"
                  tone="primary"
                  text="Enregistrer"
                  onClick={handleSaveEdit}
                />
              </Flex>
            </Flex>
          }
        >
          <Stack space={4} padding={4}>
            {editingImagePreviewUrl ? (
              <Card radius={2} overflow="hidden" border>
                <button
                  type="button"
                  aria-label="image preview"
                  className="w-full max-h-[300px] aspect-video bg-[#111] bg-no-repeat bg-center bg-contain"
                  style={{ backgroundImage: `url(${editingImagePreviewUrl})` }}
                />
              </Card>
            ) : null}

            <Stack space={1}>
              <Text size={2} weight="semibold">
                Texte Alternatif (SEO)
              </Text>
              <Text size={1} muted>
                Description de l&apos;image pour l&apos;accessibilité et le SEO
              </Text>
            </Stack>

            <Stack space={2}>
              <Label size={1} aria-label="Français">
                Français
              </Label>
              <TextInput
                value={editAlt.fr}
                onChange={e =>
                  dispatch({
                    type: 'UPDATE_EDIT_ALT',
                    lang: 'fr',
                    value: e.currentTarget.value,
                  })
                }
              />
            </Stack>

            <Stack space={2}>
              <Label size={1} aria-label="Anglais">
                Anglais
              </Label>
              <TextInput
                value={editAlt.en}
                onChange={e =>
                  dispatch({
                    type: 'UPDATE_EDIT_ALT',
                    lang: 'en',
                    value: e.currentTarget.value,
                  })
                }
              />
            </Stack>

            <Stack space={2}>
              <Label size={1} aria-label="Allemand">
                Allemand
              </Label>
              <TextInput
                value={editAlt.de}
                onChange={e =>
                  dispatch({
                    type: 'UPDATE_EDIT_ALT',
                    lang: 'de',
                    value: e.currentTarget.value,
                  })
                }
              />
            </Stack>
          </Stack>
        </Dialog>
      )}
    </Stack>
  );
}
