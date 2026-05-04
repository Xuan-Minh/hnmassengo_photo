'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Card, Checkbox, Flex, Grid, Stack, Text } from '@sanity/ui';
import {
  ArrayOfObjectsInput,
  PatchEvent,
  insert,
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

// Build a small CDN thumbnail URL from a Sanity image asset _ref.
// Ref format: image-{id}-{width}x{height}-{format}
function assetRefToThumbnailUrl(ref, projectId, dataset) {
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
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=120&h=120&fit=crop&auto=format`;
}

export default function ProjectImagesFolderInput(props) {
  const { onChange, value } = props;

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

  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());

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
        // Pour un dossier, on conserve l'ordre du chemin relatif quand dispo
        const ap = a.webkitRelativePath || a.name;
        const bp = b.webkitRelativePath || b.name;
        return ap.localeCompare(bp, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });

    if (imageFiles.length === 0) return;

    const currentCount = Array.isArray(value) ? value.length : 0;

    setIsUploading(true);
    setStatus(`Upload de ${imageFiles.length} image(s)…`);

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

        // Si aucun nom de projet n'est encore rempli, on bascule sur le nom de fichier
        const safeBase = fallbackName || stripExtension(file.name) || 'Projet';

        const alt = {
          fr: `${baseFr || safeBase} ${photoNumber}`,
          en: `${baseEn || safeBase} ${photoNumber}`,
          de: `${baseDe || safeBase} ${photoNumber}`,
        };

        setStatus(`Upload ${i + 1}/${imageFiles.length} : ${file.name}`);

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
      setStatus(`Ajouté ${newItems.length} image(s).`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setStatus(`Erreur pendant l'upload : ${err?.message || 'échec inconnu'}`);
    } finally {
      setIsUploading(false);
      // Permet de re-sélectionner le même dossier/fichiers
      if (folderInputRef.current) folderInputRef.current.value = '';
      if (filesInputRef.current) filesInputRef.current.value = '';
    }
  }

  const images = Array.isArray(value) ? value : [];

  // Intersection of selectedKeys with the images currently in the array.
  // Prevents stale keys (e.g. deleted via ArrayOfObjectsInput below) from
  // corrupting the counter and from generating orphan unset patches.
  const effectiveSelectedKeys = useMemo(
    () =>
      new Set(
        images.filter(img => selectedKeys.has(img._key)).map(img => img._key)
      ),
    [images, selectedKeys]
  );

  const toggleKey = useCallback(
    key => {
      if (!images.some(img => img._key === key)) return;
      setSelectedKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [images]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedKeys(new Set(images.map(img => img._key)));
  }, [images]);

  const handleClearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (effectiveSelectedKeys.size === 0) return;
    onChange(
      PatchEvent.from(
        Array.from(effectiveSelectedKeys).map(key => unset([{ _key: key }]))
      )
    );
    setSelectedKeys(new Set());
  }, [effectiveSelectedKeys, onChange]);

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
            ref={folderInputRef}
            type="file"
            multiple
            accept="image/*"
            // Attributs non standard mais supportés par Chromium / Safari
            webkitdirectory="true"
            directory="true"
            style={{ display: 'none' }}
            onChange={e => handleFilesSelected(e.currentTarget.files)}
          />

          <input
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
                const url = assetRefToThumbnailUrl(
                  image?.asset?._ref,
                  projectId,
                  dataset
                );
                const isSelected = effectiveSelectedKeys.has(image._key);
                return (
                  <Card
                    key={image._key}
                    padding={1}
                    radius={2}
                    border
                    tone={isSelected ? 'critical' : 'default'}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      userSelect: 'none',
                    }}
                    onClick={() => toggleKey(image._key)}
                  >
                    {url ? (
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: '100%',
                          aspectRatio: 1,
                          objectFit: 'cover',
                          borderRadius: '2px',
                          opacity: isSelected ? 0.5 : 1,
                          display: 'block',
                          pointerEvents: 'none',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: 1,
                          background: '#e0e0e0',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                    {/* Prevents card click from firing twice when clicking the checkbox */}
                    <div
                      style={{ position: 'absolute', top: 4, right: 4 }}
                      onPointerDown={e => e.stopPropagation()}
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

      <ArrayOfObjectsInput {...props} />
    </Stack>
  );
}
