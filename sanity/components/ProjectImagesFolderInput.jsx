'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Button, Card, Flex, Stack, Text } from '@sanity/ui';
import {
  ArrayOfObjectsInput,
  PatchEvent,
  insert,
  setIfMissing,
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

export default function ProjectImagesFolderInput(props) {
  const { onChange, value } = props;

  const client = useClient({ apiVersion });

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

      <ArrayOfObjectsInput {...props} />
    </Stack>
  );
}
