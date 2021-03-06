/**
 * Makes [rollback] links for edits excecute without an additional page load. Including self-closing bookmarklet option.
 *
 * @see: [[phab:T33270]]
 * @author: [[w:en:User:Gracenotes]]
 * @author: [[m:User:Krinkle]]
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 * @source: Based on [[m:User:Krinkle/Scripts/AjaxPatrolLinks.js]] and [[w:en:User:Gracenotes/rollback.js]]
 * FIXME: Use MediaWiki API
 */
( function ( $ ) {
	'use strict';

	function ajaxRollback() {
		var	$rollbackLinks = $( '.mw-rollback-link a' ),
			prevUser,
			rollbackSummaryDefault,
			useAJAX = function ( e ) {
				e.preventDefault();
				var $this = $( this ),
					href = $this.attr( 'href' ) + '&bot=1';
				$this.text( 'Rolling back...' );
				$rollbackLinks = $this.parent();
				$.get(
					href,
					null,
					/*jshint unused:false */
					function ( data, status/*, request*/ ) {
						if ( status === 'success' ) {
							$this.text( 'Rolled back' )
								.css( 'color', 'green' )
								.attr( 'href', mw.util.getUrl( null, { diff: 0 } ) )
								.off( 'click', useAJAX );
							$( '.patrollink' ).remove();
						} else {
							// MediaWiki:Rollbackfailed
							$this.html( '<span style="color:red">Rollback failed</span>' );
						}
					}
					/*jshint unused:true */
				);
			};
		if ( $rollbackLinks.length > 0 ) {
			rollbackSummaryDefault = 'Foram revertidas as edições de $user';
			prevUser = $( '#mw-diff-otitle2' ).find( 'a' ).first().text();
			if ( prevUser ) {
				rollbackSummaryDefault += ', com o conteúdo passando a estar como na última edição de ' + prevUser;
			}
			rollbackSummaryDefault += '.';
			$rollbackLinks.each( function () {
				var $this = $( this );
				$this.after(
					$this.clone()
					.text( '+sum' )
					.attr( 'class', '' )
					.click( function confirmRollback( e ) {
						var extraSum,
							url = this.href,
							user = url.match( /[?&]from=([^&]*)/ );
						e.preventDefault();
						if ( !user ) {
							return;
						}
						user = decodeURIComponent( user[ 1 ].replace( /\+/g, ' ' ) );
						extraSum = prompt(
							'Informe mais detalhes sobre o motivo desta reversão.\n\n' +
							'Deixe em branco para utilizar o padrão.' +
							' $user será trocado por "' + user + '".'
						);
						if ( extraSum === null ) {
							return;
						}
						if ( extraSum === '' ) {
							useAJAX.call( this, e );
						}
						this.href += '&summary=' + encodeURIComponent(
							( rollbackSummaryDefault + ' ' + extraSum.charAt( 0 ).toUpperCase() + extraSum.slice( 1 ) )
							.replace( /\$user/g, user )
						);
						useAJAX.call( this, e );
					} )
				).after( ' | ' )
				.click( useAJAX );
			} );
		}
	}
	$.when(
		mw.loader.using( 'mediawiki.util' ),
		$.ready
	).then( ajaxRollback );

}( jQuery ) );
