;;; ==========================================================================
;;; AREASPOL.lsp
;;; --------------------------------------------------------------------------
;;; Comando: AREASPOL
;;;
;;; Selecciona TODAS las polilineas cerradas (LWPOLYLINE) de una capa concreta
;;; y coloca en el centro de cada una un texto con su superficie, aplicando la
;;; tabla de redondeo Bluespace.
;;;
;;; Uso:
;;;   1. En AutoCAD escribe:  APPLOAD
;;;   2. Carga este archivo (AREASPOL.lsp).
;;;   3. Ejecuta el comando:  AREASPOL
;;;   4. Escribe el nombre EXACTO de la capa.
;;;   5. Indica la altura del texto (Enter = 0.25).
;;;
;;; Nota sobre unidades:
;;;   El codigo supone que el dibujo esta en METROS. Si dibujas en MILIMETROS,
;;;   descomenta la linea marcada mas abajo para dividir el area entre 1000000.
;;; ==========================================================================

;;; --------------------------------------------------------------------------
;;; Redondeo segun tabla Bluespace
;;;   Devuelve el area "mostrada" a partir del area real.
;;;   Cualquier superficie mayor de 22 m2 se convierte en 25 m2.
;;; --------------------------------------------------------------------------
(defun BS-RedondearArea (area)
  (cond
    ((<= area 1.25)  1.0)
    ((<= area 1.75)  1.5)
    ((<= area 2.25)  2.0)
    ((<= area 2.75)  2.5)
    ((<= area 3.25)  3.0)
    ((<= area 3.75)  3.5)
    ((<= area 4.40)  4.0)
    ((<= area 4.60)  4.5)
    ((<= area 5.40)  5.0)
    ((<= area 6.50)  6.0)
    ((<= area 7.50)  7.0)
    ((<= area 8.50)  8.0)
    ((<= area 9.50)  9.0)
    ((<= area 11.50) 10.0)
    ((<= area 13.50) 12.0)
    ((<= area 16.50) 15.0)
    ((<= area 19.50) 18.0)
    ((<= area 22.00) 21.0)
    (T 25.0)
  )
)

;;; --------------------------------------------------------------------------
;;; Formato del numero
;;;   Enteros sin decimales (4 -> "4"), medios con un decimal (4.5 -> "4.5").
;;; --------------------------------------------------------------------------
(defun BS-FormatoArea (area)
  (if (= area (fix area))
    (rtos area 2 0)
    (rtos area 2 1)
  )
)

;;; --------------------------------------------------------------------------
;;; Comando principal
;;; --------------------------------------------------------------------------
(defun c:AREASPOL
  (/ capa altura ss i obj area-real area-redondeada
     minPt maxPt centro texto doc espacio)

  (vl-load-com)
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (setq espacio
    (if (= 1 (getvar "CVPORT"))
      (vla-get-PaperSpace doc)
      (vla-get-ModelSpace doc)
    )
  )

  ;; Nombre de la capa de las polilineas
  (setq capa
    (getstring T "\nEscribe el nombre de la capa de las polilineas: ")
  )

  ;; Altura del texto (Enter = 0.25)
  (setq altura (getdist "\nIndica la altura del texto <0.25>: "))
  (if (null altura)
    (setq altura 0.25)
  )

  ;; Seleccionar todas las polilineas cerradas de la capa indicada
  (setq ss
    (ssget "_X"
      (list
        '(0 . "LWPOLYLINE")
        (cons 8 capa)
        '(-4 . "&")
        '(70 . 1)
      )
    )
  )

  (if ss
    (progn
      (setq i 0)
      (repeat (sslength ss)
        (setq obj (vlax-ename->vla-object (ssname ss i)))

        ;; Area geometrica real
        (setq area-real (vla-get-Area obj))
        ;; --- Si el dibujo esta en MILIMETROS, descomenta la linea siguiente: ---
        ;; (setq area-real (/ (vla-get-Area obj) 1000000.0))

        ;; Aplicar redondeo Bluespace
        (setq area-redondeada (BS-RedondearArea area-real))

        ;; Caja envolvente -> centro
        (vla-GetBoundingBox obj 'minPt 'maxPt)
        (setq minPt (vlax-safearray->list minPt))
        (setq maxPt (vlax-safearray->list maxPt))
        (setq centro
          (vlax-3d-point
            (list
              (/ (+ (car minPt) (car maxPt)) 2.0)
              (/ (+ (cadr minPt) (cadr maxPt)) 2.0)
              0.0
            )
          )
        )

        ;; Crear el texto
        (setq texto
          (vla-AddText
            espacio
            (strcat (BS-FormatoArea area-redondeada) " m2")
            centro
            altura
          )
        )

        ;; Centrar horizontal y verticalmente (acAlignmentMiddleCenter = 10)
        (vla-put-Alignment texto 10)
        (vla-put-TextAlignmentPoint texto centro)

        ;; Dejar el texto en la misma capa que la polilinea
        (vla-put-Layer texto capa)

        (setq i (1+ i))
      )
      (princ
        (strcat
          "\nSe han generado "
          (itoa (sslength ss))
          " textos con las areas redondeadas."
        )
      )
    )
    (princ "\nNo se encontraron polilineas cerradas en esa capa.")
  )
  (princ)
)

(princ "\nComando AREASPOL cargado. Escribe AREASPOL para ejecutarlo.")
(princ)
