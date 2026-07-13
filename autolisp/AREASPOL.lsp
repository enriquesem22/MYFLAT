;;; ==========================================================================
;;; AREASPOL.lsp
;;; --------------------------------------------------------------------------
;;; Comando: AREASPOL
;;;
;;; Coloca en el centro de cada polilinea cerrada un TEXTO con su superficie
;;; redondeada (tabla Bluespace, sin "m2"), lleva cada texto a la CAPA que le
;;; corresponde segun el tamano (mapa boxs_texts_layer_names del config.yml) y
;;; genera una TABLA resumen dibujada en el plano con el numero de cada tamano.
;;;
;;; Al ejecutarlo puedes elegir:
;;;   - Todo       : todas las polilineas cerradas de una capa (seleccionas
;;;                  un objeto de esa capa).
;;;   - Seleccionar: eliges tu manualmente las polilineas (util para hacer el
;;;                  recuento por plantas).
;;;
;;; Uso:
;;;   1. En AutoCAD escribe:  APPLOAD  y carga este archivo.
;;;   2. Ejecuta el comando:  AREASPOL
;;;
;;; Nota sobre unidades:
;;;   El codigo supone que el dibujo esta en METROS. Si dibujas en MILIMETROS,
;;;   descomenta la linea marcada mas abajo para dividir el area entre 1000000.
;;; ==========================================================================

;;; --------------------------------------------------------------------------
;;; Redondeo segun tabla Bluespace (box_target_areas)
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
;;; Capa de destino segun el area (boxs_texts_layer_names)
;;; --------------------------------------------------------------------------
(defun BS-CapaPorArea (area)
  (cond
    ((<= area 1.25)  "BS-61-S-1.0 sqm")
    ((<= area 1.75)  "BS-61-S-1.5 sqm")
    ((<= area 2.25)  "BS-61-S-2.0 sqm")
    ((<= area 2.75)  "BS-61-S-2.5 sqm")
    ((<= area 3.25)  "BS-61-S-3.0 sqm")
    ((<= area 3.75)  "BS-61-S-3.5 sqm")
    ((<= area 4.40)  "BS-62-M-4.0 sqm")
    ((<= area 4.60)  "BS-62-M-4.5 sqm")
    ((<= area 5.40)  "BS-62-M-5.0 sqm")
    ((<= area 6.50)  "BS-62-M-6.0 sqm")
    ((<= area 7.50)  "BS-62-M-7.0 sqm")
    ((<= area 8.50)  "BS-62-M-8.0 sqm")
    ((<= area 9.50)  "BS-62-M-9.0 sqm")
    ((<= area 11.50) "BS-63-L-10.0 sqm")
    ((<= area 13.50) "BS-63-L-12.0 sqm")
    ((<= area 16.50) "BS-63-L-15.0 sqm")
    ((<= area 19.50) "BS-63-L-18.0 sqm")
    ((<= area 22.00) "BS-64-XL-21.0 sqm")
    (T               "BS-64-XL-25.0 sqm")
  )
)

;;; --------------------------------------------------------------------------
;;; Formato del numero: entero sin decimal (4), medio con un decimal (4.5)
;;; --------------------------------------------------------------------------
(defun BS-FormatoArea (area)
  (if (= area (fix area))
    (rtos area 2 0)
    (rtos area 2 1)
  )
)

;;; --------------------------------------------------------------------------
;;; Asegura que una capa existe (la crea si hace falta) y devuelve su nombre.
;;; --------------------------------------------------------------------------
(defun BS-AsegurarCapa (nombre doc)
  (if (vl-catch-all-error-p
        (vl-catch-all-apply 'vla-Item (list (vla-get-Layers doc) nombre)))
    (vla-Add (vla-get-Layers doc) nombre)
  )
  nombre
)

;;; --------------------------------------------------------------------------
;;; Incrementa el contador de 'clave' en una lista (clave . n)
;;; --------------------------------------------------------------------------
(defun BS-Incrementar (clave lst)
  (if (assoc clave lst)
    (subst (cons clave (1+ (cdr (assoc clave lst)))) (assoc clave lst) lst)
    (cons (cons clave 1) lst)
  )
)

;;; --------------------------------------------------------------------------
;;; Rellena una cadena con espacios por la derecha hasta 'n' caracteres.
;;; --------------------------------------------------------------------------
(defun BS-Pad (s n)
  (while (< (strlen s) n) (setq s (strcat s " ")))
  s
)

;;; --------------------------------------------------------------------------
;;; Dibuja la tabla resumen en el plano.
;;;   presentes = lista ordenada de (valor . cantidad)
;;; --------------------------------------------------------------------------
(defun BS-DibujarTabla (espacio presentes total altura / pt tabla nfilas r)
  (setq pt (getpoint "\nIndica el punto de insercion de la tabla resumen: "))
  (if pt
    (progn
      ;; filas: titulo + cabecera + una por tamano + total
      (setq nfilas (+ (length presentes) 3))
      (setq tabla
        (vla-AddTable
          espacio
          (vlax-3d-point pt)
          nfilas 2
          (* altura 2.0)     ; alto de fila
          (* altura 10.0)    ; ancho de columna
        )
      )
      ;; Ajustes de aspecto (protegidos por si la version no los soporta)
      (vl-catch-all-apply 'vla-SetTextHeight (list tabla 7 altura))       ; 1+2+4 = todas
      (vl-catch-all-apply 'vla-SetColumnWidth (list tabla 0 (* altura 12.0)))
      (vl-catch-all-apply 'vla-SetColumnWidth (list tabla 1 (* altura 8.0)))

      ;; Titulo (fila 0, se fusiona automaticamente)
      (vla-SetText tabla 0 0 "RESUMEN DE SUPERFICIES")
      ;; Cabecera (fila 1)
      (vla-SetText tabla 1 0 "Tamano")
      (vla-SetText tabla 1 1 "Cantidad")
      ;; Datos
      (setq r 2)
      (foreach par presentes
        (vla-SetText tabla r 0 (BS-FormatoArea (car par)))
        (vla-SetText tabla r 1 (itoa (cdr par)))
        (setq r (1+ r))
      )
      ;; Total
      (vla-SetText tabla r 0 "TOTAL")
      (vla-SetText tabla r 1 (itoa total))
      (princ "\nTabla resumen creada.")
    )
    (princ "\nNo se indico punto: no se dibujo la tabla.")
  )
)

;;; --------------------------------------------------------------------------
;;; Comando principal
;;; --------------------------------------------------------------------------
(defun c:AREASPOL
  (/ modo capa altura ss i obj area-real area-redondeada capa-destino
     conteo total presentes orden ent minPt maxPt centro texto doc espacio)

  (vl-load-com)
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (setq espacio
    (if (= 1 (getvar "CVPORT"))
      (vla-get-PaperSpace doc)
      (vla-get-ModelSpace doc)
    )
  )

  ;; --- Modo de conteo -----------------------------------------------------
  (initget "Todo Seleccionar")
  (setq modo
    (getkword "\nQue contar? [Todo/Seleccionar] <Todo>: ")
  )
  (if (null modo) (setq modo "Todo"))

  ;; --- Obtener el conjunto de polilineas cerradas -------------------------
  (if (= modo "Todo")
    (progn
      (setq ent (entsel "\nSelecciona un objeto de la capa de las polilineas: "))
      (if (null ent)
        (progn (princ "\nNada seleccionado. Comando cancelado.") (exit))
      )
      (setq capa (cdr (assoc 8 (entget (car ent)))))
      (princ (strcat "\nCapa: " capa))
      (setq ss
        (ssget "_X"
          (list '(0 . "LWPOLYLINE") (cons 8 capa) '(-4 . "&") '(70 . 1))
        )
      )
    )
    ;; modo "Seleccionar"
    (progn
      (princ "\nSelecciona las polilineas cerradas a incluir (por plantas): ")
      (setq ss
        (ssget (list '(0 . "LWPOLYLINE") '(-4 . "&") '(70 . 1)))
      )
    )
  )

  ;; --- Altura del texto ---------------------------------------------------
  (setq altura (getdist "\nIndica la altura del texto <0.25>: "))
  (if (null altura) (setq altura 0.25))

  (if ss
    (progn
      (setq i 0 conteo nil)
      (repeat (sslength ss)
        (setq obj (vlax-ename->vla-object (ssname ss i)))

        ;; Area geometrica real
        (setq area-real (vla-get-Area obj))
        ;; --- Si el dibujo esta en MILIMETROS, descomenta la linea siguiente: ---
        ;; (setq area-real (/ (vla-get-Area obj) 1000000.0))

        (setq area-redondeada (BS-RedondearArea area-real))
        (setq capa-destino    (BS-AsegurarCapa (BS-CapaPorArea area-real) doc))
        (setq conteo          (BS-Incrementar area-redondeada conteo))

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

        ;; Texto solo con el numero (sin "m2")
        (setq texto
          (vla-AddText espacio (BS-FormatoArea area-redondeada) centro altura)
        )
        (vla-put-Alignment texto 10)              ; acAlignmentMiddleCenter
        (vla-put-TextAlignmentPoint texto centro)
        (vla-put-Layer texto capa-destino)

        (setq i (1+ i))
      )

      ;; --- Construir lista ordenada de tamanos presentes y total ----------
      (setq orden
        '(1.0 1.5 2.0 2.5 3.0 3.5 4.0 4.5 5.0 6.0
          7.0 8.0 9.0 10.0 12.0 15.0 18.0 21.0 25.0)
      )
      (setq presentes nil total 0)
      (foreach v orden
        (if (assoc v conteo)
          (progn
            (setq presentes (cons (cons v (cdr (assoc v conteo))) presentes))
            (setq total (+ total (cdr (assoc v conteo))))
          )
        )
      )
      (setq presentes (reverse presentes))

      ;; --- Resumen en la linea de comandos --------------------------------
      (princ "\n\n========= RESUMEN POR TAMANO =========")
      (foreach par presentes
        (princ
          (strcat "\n  Tamano " (BS-Pad (BS-FormatoArea (car par)) 5)
                  " : " (itoa (cdr par)))
        )
      )
      (princ "\n  -----------------------------------")
      (princ (strcat "\n  TOTAL   : " (itoa total)))
      (princ "\n======================================")

      ;; --- Tabla dibujada en el plano -------------------------------------
      (BS-DibujarTabla espacio presentes total altura)
    )
    (princ "\nNo se encontraron polilineas cerradas.")
  )
  (princ)
)

(princ "\nComando AREASPOL cargado. Escribe AREASPOL para ejecutarlo.")
(princ)
