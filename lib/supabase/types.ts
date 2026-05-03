export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string
          nom: string
          description: string | null
          adresse: string | null
          telephone: string | null
          email: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          description?: string | null
          adresse?: string | null
          telephone?: string | null
          email?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          description?: string | null
          adresse?: string | null
          telephone?: string | null
          email?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      profiles: {
        Row: {
          id: string
          nom: string
          email: string
          role: "admin" | "user"
          organisation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nom: string
          email: string
          role?: "admin" | "user"
          organisation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          email?: string
          role?: "admin" | "user"
          organisation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      blocs: {
        Row: {
          id: string
          organisation_id: string
          nom: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          nom: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          nom?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      immeubles: {
        Row: {
          id: string
          organisation_id: string
          bloc_id: string
          nom: string
          description: string | null
          adresse: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          bloc_id: string
          nom: string
          description?: string | null
          adresse?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          bloc_id?: string
          nom?: string
          description?: string | null
          adresse?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "immeubles_bloc_id_fkey"
            columns: ["bloc_id"]
            isOneToOne: false
            referencedRelation: "blocs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immeubles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      coproprietaires: {
        Row: {
          id: string
          organisation_id: string
          immeuble_id: string | null
          nom: string
          prenom: string
          adresse: string | null
          cin: string | null
          telephone: string | null
          telephone_etranger: string | null
          numero_appartement: string
          titre_foncier: string | null
          montant_annuel: number
          total_dettes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          immeuble_id?: string | null
          nom: string
          prenom: string
          adresse?: string | null
          cin?: string | null
          telephone?: string | null
          telephone_etranger?: string | null
          numero_appartement: string
          titre_foncier?: string | null
          montant_annuel?: number
          total_dettes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          immeuble_id?: string | null
          nom?: string
          prenom?: string
          adresse?: string | null
          cin?: string | null
          telephone?: string | null
          telephone_etranger?: string | null
          numero_appartement?: string
          titre_foncier?: string | null
          montant_annuel?: number
          total_dettes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coproprietaires_immeuble_id_fkey"
            columns: ["immeuble_id"]
            isOneToOne: false
            referencedRelation: "immeubles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coproprietaires_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      professions: {
        Row: {
          id: string
          organisation_id: string
          nom: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          nom: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          nom?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      ouvriers: {
        Row: {
          id: string
          organisation_id: string
          nom: string
          prenom: string
          adresse: string | null
          telephone_maroc: string | null
          metier: string
          statut: "actif" | "inactif"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          nom: string
          prenom: string
          adresse?: string | null
          telephone_maroc?: string | null
          metier: string
          statut?: "actif" | "inactif"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          nom?: string
          prenom?: string
          adresse?: string | null
          telephone_maroc?: string | null
          metier?: string
          statut?: "actif" | "inactif"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ouvriers_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      paiements: {
        Row: {
          id: string
          organisation_id: string
          coproprietaire_id: string
          montant: number
          montant_du: number
          montant_restant: number
          annee: string
          date_paiement: string | null
          statut: "paye" | "partiel" | "impaye"
          methode_paiement: "especes" | "cheque" | "virement"
          numero_cheque: string | null
          numero_virement: string | null
          preuve_paiement: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          coproprietaire_id: string
          montant: number
          montant_du: number
          montant_restant: number
          annee: string
          date_paiement?: string | null
          statut: "paye" | "partiel" | "impaye"
          methode_paiement: "especes" | "cheque" | "virement"
          numero_cheque?: string | null
          numero_virement?: string | null
          preuve_paiement?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          coproprietaire_id?: string
          montant?: number
          montant_du?: number
          montant_restant?: number
          annee?: string
          date_paiement?: string | null
          statut?: "paye" | "partiel" | "impaye"
          methode_paiement?: "especes" | "cheque" | "virement"
          numero_cheque?: string | null
          numero_virement?: string | null
          preuve_paiement?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paiements_coproprietaire_id_fkey"
            columns: ["coproprietaire_id"]
            isOneToOne: false
            referencedRelation: "coproprietaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paiements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      ventes: {
        Row: {
          id: string
          organisation_id: string
          vendeur_id: string | null
          acheteur_nom: string
          acheteur_contact: string | null
          acheteur_email: string | null
          immeuble_id: string | null
          numero_appartement: string
          date_vente: string | null
          date_quitus: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          vendeur_id?: string | null
          acheteur_nom: string
          acheteur_contact?: string | null
          acheteur_email?: string | null
          immeuble_id?: string | null
          numero_appartement: string
          date_vente?: string | null
          date_quitus: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          vendeur_id?: string | null
          acheteur_nom?: string
          acheteur_contact?: string | null
          acheteur_email?: string | null
          immeuble_id?: string | null
          numero_appartement?: string
          date_vente?: string | null
          date_quitus?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventes_immeuble_id_fkey"
            columns: ["immeuble_id"]
            isOneToOne: false
            referencedRelation: "immeubles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventes_vendeur_id_fkey"
            columns: ["vendeur_id"]
            isOneToOne: false
            referencedRelation: "coproprietaires"
            referencedColumns: ["id"]
          }
        ]
      }

      certificats_paiement: {
        Row: {
          id: string
          organisation_id: string
          coproprietaire_id: string
          periode: string
          montant_total: number
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          coproprietaire_id: string
          periode: string
          montant_total: number
          created_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          coproprietaire_id?: string
          periode?: string
          montant_total?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificats_paiement_coproprietaire_id_fkey"
            columns: ["coproprietaire_id"]
            isOneToOne: false
            referencedRelation: "coproprietaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificats_paiement_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }

      action_history: {
        Row: {
          id: string
          organisation_id: string
          user_id: string | null
          action: "CREATE" | "UPDATE" | "DELETE"
          entity: string
          entity_id: string
          details: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          user_id?: string | null
          action: "CREATE" | "UPDATE" | "DELETE"
          entity: string
          entity_id: string
          details?: string | null
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: "action_history_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }
    }

    Views: {
      dashboard_stats: {
        Row: {
          organisation_id: string
          total_coproprietaires: number
          total_debiteurs: number
          ouvriers_actifs: number
          total_blocs: number
          total_immeubles: number
          montant_collecte: number
          paiements_partiels: number
          paiements_impayes: number
        }
        Relationships: []
      }
      collecte_mensuelle: {
        Row: {
          organisation_id: string
          annee: number
          mois: number
          montant_paye: number
          montant_partiel: number
          nb_paiements: number
        }
        Relationships: []
      }
      arrieres: {
        Row: {
          organisation_id: string
          coproprietaire_id: string
          nom: string
          prenom: string
          numero_appartement: string
          total_dettes: number
          dernier_paiement: string | null
        }
        Relationships: []
      }
    }

    Functions: {
      get_my_org_id: {
        Args: Record<never, never>
        Returns: string
      }
      is_org_admin: {
        Args: Record<never, never>
        Returns: boolean
      }
      payer_cotisation: {
        Args: {
          p_coproprietaire_id: string
          p_annee: string
          p_montant: number
          p_methode: "especes" | "cheque" | "virement"
          p_numero_ref?: string
        }
        Returns: {
          id: string
          organisation_id: string
          coproprietaire_id: string
          montant: number
          montant_du: number
          montant_restant: number
          annee: string
          date_paiement: string | null
          statut: "paye" | "partiel" | "impaye"
          methode_paiement: "especes" | "cheque" | "virement"
          numero_cheque: string | null
          numero_virement: string | null
          preuve_paiement: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
    }

    Enums: {
      user_role: "admin" | "user"
      statut_ouvrier: "actif" | "inactif"
      statut_paiement: "paye" | "partiel" | "impaye"
      methode_paiement: "especes" | "cheque" | "virement"
      action_type: "CREATE" | "UPDATE" | "DELETE"
    }

    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience aliases
export type Organisation = Database["public"]["Tables"]["organisations"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Bloc = Database["public"]["Tables"]["blocs"]["Row"]
export type Immeuble = Database["public"]["Tables"]["immeubles"]["Row"]
export type Coproprietaire = Database["public"]["Tables"]["coproprietaires"]["Row"]
export type Profession = Database["public"]["Tables"]["professions"]["Row"]
export type Ouvrier = Database["public"]["Tables"]["ouvriers"]["Row"]
export type Paiement = Database["public"]["Tables"]["paiements"]["Row"]
export type Vente = Database["public"]["Tables"]["ventes"]["Row"]
export type CertificatPaiement = Database["public"]["Tables"]["certificats_paiement"]["Row"]
export type ActionHistory = Database["public"]["Tables"]["action_history"]["Row"]
export type DashboardStats = Database["public"]["Views"]["dashboard_stats"]["Row"]
export type CollecteMensuelle = Database["public"]["Views"]["collecte_mensuelle"]["Row"]
export type Arriere = Database["public"]["Views"]["arrieres"]["Row"]
