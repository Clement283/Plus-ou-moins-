-- Compte « aperçu » : tous les cours sont ouverts (pour que le porteur du projet relise l'appli sans faire les cours dans l'ordre).
ALTER TABLE users ADD COLUMN apercu INTEGER NOT NULL DEFAULT 0;
